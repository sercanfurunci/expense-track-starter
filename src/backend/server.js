// Required SQL migrations:
// CREATE TABLE users (
//   id SERIAL PRIMARY KEY,
//   email VARCHAR(255) UNIQUE,
//   password TEXT NOT NULL,
//   is_verified BOOLEAN DEFAULT FALSE,
//   verify_token TEXT,
//   verify_expires TIMESTAMP,
//   reset_token TEXT,
//   reset_expires TIMESTAMP,
//   username TEXT,
//   currency TEXT DEFAULT 'USD',
//   created_at TIMESTAMP DEFAULT NOW()
// );
// ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_token TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_expires TIMESTAMP;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
// ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_method TEXT DEFAULT 'email';
// ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_email TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 0;  ← NEW
// ALTER TABLE transactions ADD COLUMN user_id INTEGER REFERENCES users(id);

require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const cookieParser = require("cookie-parser");
const { Pool }   = require("pg");
const bcrypt     = require("bcrypt");
const jwt        = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const rateLimit  = require("express-rate-limit");
const crypto     = require("crypto");
const swaggerUi  = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const admin      = require("firebase-admin");

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
  });
}

const app = express();
const JWT_SECRET   = process.env.JWT_SECRET;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!JWT_SECRET || !ADMIN_SECRET) {
  console.error("Missing JWT_SECRET or ADMIN_SECRET in .env — server stopped.");
  process.exit(1);
}

if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  console.error("Missing MAIL_USER or MAIL_PASS in .env — server stopped.");
  process.exit(1);
}

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
// Treat as prod whenever FRONTEND_URL points to a non-localhost domain
// (covers Render deployments that don't set NODE_ENV=production)
const isProd = process.env.NODE_ENV === "production" ||
               !FRONTEND_URL.startsWith("http://localhost");

// CORS must run before helmet so credentials header isn't stripped
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      origin.startsWith("http://localhost:") ||
      origin === FRONTEND_URL ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(helmet());

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// [FIX 7] httpOnly cookie options — cross-origin (Vercel→Render) needs sameSite:"none" + secure in prod
const COOKIE_OPTS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

app.use(generalLimiter);

const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/register-phone",
  "/auth/forgot-password",
  "/auth/reset-password",
];
AUTH_ROUTES.forEach((route) => app.use(route, authLimiter));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Expense Tracker API", version: "1.0.0", description: "Transactions API" },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./server.js"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:     Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false },
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

// ─── Input validation helpers ────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+[1-9]\d{6,14}$/;
const HEX64_RE = /^[0-9a-f]{64}$/;

const VALID_TYPES      = new Set(["income", "expense"]);
const VALID_CATEGORIES = new Set(["food", "housing", "utilities", "transport", "entertainment", "salary", "other"]);
const VALID_CURRENCIES = new Set(["USD", "EUR", "GBP", "TRY", "JPY", "CAD", "AUD", "CHF"]);

function trimStr(val, maxLen) {
  if (typeof val !== "string") return null;
  const s = val.trim();
  return s.length > 0 && s.length <= maxLen ? s : null;
}
function isValidEmail(email) {
  const s = trimStr(email, 255);
  return s && EMAIL_RE.test(s) ? s : null;
}
function isValidPhone(phone) {
  const s = trimStr(phone, 20);
  return s && PHONE_RE.test(s) ? s : null;
}
function isValidToken(token) {
  const s = trimStr(token, 128);
  return s && HEX64_RE.test(s) ? s : null;
}
function isValidId(id) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}
function isValidAmount(amount) {
  const n = Number(amount);
  return Number.isFinite(n) && n > 0 && n < 1_000_000_000 ? n : null;
}
function isValidDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function validatePassword(password) {
  if (!password || typeof password !== "string") return "Password required";
  if (password.length < 8)   return "Password must be at least 8 characters";
  if (password.length > 128) return "Password too long";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

// [FIX 6] token_version — reads cookie first, falls back to Bearer header
const authMiddleware = async (req, res, next) => {
  const raw =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!raw) return res.status(401).json({ error: "Unauthorized" });

  let payload;
  try {
    // [FIX 2] Explicit algorithm prevents none/RS256 downgrade
    payload = jwt.verify(raw, JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const tv = await pool.query("SELECT token_version FROM users WHERE id = $1", [payload.id]);
    if (!tv.rows.length) return res.status(401).json({ error: "User not found" });
    const dbTv = tv.rows[0].token_version;
    if (dbTv != null && payload.tv != null && payload.tv !== dbTv) {
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }
  } catch {
    // token_version column may not exist yet — skip version check, still allow request
  }

  req.user = payload;
  next();
};

app.get("/", (req, res) => res.send("Backend running 🚀"));

// ─── Admin ───────────────────────────────────────────────────────────────────

app.get("/admin/users", async (req, res) => {
  // [FIX 3] Timing-safe comparison prevents secret extraction via response-time attacks
  const provided = Buffer.from(req.headers["x-admin-secret"] || "");
  const expected = Buffer.from(ADMIN_SECRET);
  const valid = provided.length === expected.length &&
    crypto.timingSafeEqual(provided, expected);
  if (!valid) return res.status(403).json({ error: "Forbidden" });

  try {
    const result = await pool.query(
      "SELECT id, email, is_verified, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post("/auth/register", async (req, res) => {
  const email    = isValidEmail(req.body.email);
  const password = trimStr(req.body.password, 128);

  if (!email)    return res.status(400).json({ error: "Valid email required" });
  if (!password) return res.status(400).json({ error: "Password required" });

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "Email already registered" });

    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ error: pwError });

    const password_hash = await bcrypt.hash(password, 10);
    const verifyToken   = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO users (email, password, is_verified, verify_token, verify_expires)
       VALUES ($1, $2, FALSE, $3, $4)`,
      [email, password_hash, verifyToken, verifyExpires]
    );

    const verifyUrl = `${process.env.BACKEND_URL || "http://localhost:3000"}/auth/verify?token=${verifyToken}`;
    await transporter.sendMail({
      from: `"Finance Tracker" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#7c3aed;color:#fff;font-size:22px;font-weight:bold;width:48px;height:48px;line-height:48px;border-radius:12px;">$</div>
            <h2 style="margin:12px 0 4px;color:#1e293b;">Finance Tracker</h2>
            <p style="color:#64748b;margin:0;font-size:14px;">Email Verification</p>
          </div>
          <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
            <p style="color:#334155;margin:0 0 20px;">Click the button below to verify your email address. This link expires in <strong>24 hours</strong>.</p>
            <a href="${verifyUrl}" style="display:block;text-align:center;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px;">Verify Email</a>
            <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;text-align:center;">Or copy this link:<br/><span style="color:#7c3aed;">${verifyUrl}</span></p>
          </div>
        </div>`,
    });

    res.status(201).json({ message: "Verification email sent. Please check your inbox." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.get("/auth/verify", async (req, res) => {
  const token = isValidToken(req.query.token);
  if (!token) return res.status(400).send("Invalid or missing token");

  try {
    const result = await pool.query("SELECT * FROM users WHERE verify_token = $1", [token]);
    if (result.rows.length === 0)
      return res.status(400).send(verifyHtmlPage("Invalid or already used verification link.", false));

    const user = result.rows[0];
    if (new Date() > new Date(user.verify_expires))
      return res.status(400).send(verifyHtmlPage("Verification link has expired. Please register again.", false));

    await pool.query(
      "UPDATE users SET is_verified = TRUE, verify_token = NULL, verify_expires = NULL WHERE id = $1",
      [user.id]
    );
    res.send(verifyHtmlPage("Email verified! You can now sign in.", true));
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

function verifyHtmlPage(message, success) {
  const color = success ? "#10b981" : "#ef4444";
  const icon  = success ? "✓" : "✕";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Email Verification</title></head>
  <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;">
    <div style="text-align:center;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px 48px;max-width:400px;">
      <div style="width:56px;height:56px;border-radius:50%;background:${color}22;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;color:${color};">${icon}</div>
      <div style="font-size:24px;font-weight:bold;color:#fff;margin-bottom:8px;">Finance Tracker</div>
      <p style="color:#94a3b8;margin:0 0 24px;">${message}</p>
      <a href="${FRONTEND_URL}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:10px 28px;border-radius:10px;font-weight:600;">Go to App</a>
    </div>
  </body></html>`;
}

app.post("/auth/login", async (req, res) => {
  const password = trimStr(req.body.password, 128);
  if (!password) return res.status(400).json({ error: "Credentials required" });

  const email = req.body.email ? isValidEmail(req.body.email) : null;
  const phone = req.body.phone ? isValidPhone(req.body.phone) : null;
  if (!email && !phone) return res.status(400).json({ error: "Valid email or phone required" });

  try {
    const result = phone
      ? await pool.query("SELECT * FROM users WHERE phone = $1", [phone])
      : await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    if (!await bcrypt.compare(password, user.password))
      return res.status(401).json({ error: "Invalid credentials" });

    // Only block if there is an active pending verification token (accounts created before
    // email verification was added have is_verified=false but no verify_token — allow those)
    if (!user.is_verified && user.verify_token)
      return res.status(403).json({ error: "Please verify your email before logging in. Check your inbox." });

    const tv = user.token_version ?? 0;
    // [FIX 2] Explicit algorithm on sign
    const jwtToken = jwt.sign({ id: user.id, email: user.email, tv }, JWT_SECRET, {
      expiresIn: "7d",
      algorithm: "HS256",
    });

    res.cookie("token", jwtToken, COOKIE_OPTS);
    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email || null,
        phone: user.phone || null,
        username: user.username || null,
        currency: user.currency || "USD",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// [FIX 7] Logout — clears the httpOnly cookie
app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", { ...COOKIE_OPTS, maxAge: 0 });
  res.json({ message: "Logged out" });
});

app.post("/auth/register-phone", async (req, res) => {
  if (!admin.apps.length)
    return res.status(503).json({ error: "SMS registration not configured on server" });

  const firebaseToken = trimStr(req.body.firebaseToken, 2048);
  const phone         = isValidPhone(req.body.phone);
  const password      = trimStr(req.body.password, 128);

  if (!firebaseToken) return res.status(400).json({ error: "firebaseToken required" });
  if (!phone)         return res.status(400).json({ error: "Valid phone number required (E.164 format)" });
  if (!password)      return res.status(400).json({ error: "Password required" });

  try {
    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    if (decoded.phone_number !== phone)
      return res.status(400).json({ error: "Phone number mismatch" });

    const existing = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Phone number already registered" });

    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ error: pwError });

    const password_hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (phone, password, is_verified, verify_method) VALUES ($1, $2, TRUE, 'sms')`,
      [phone, password_hash]
    );
    res.status(201).json({ message: "Account created successfully." });
  } catch (err) {
    console.error(err);
    if (err.code === "auth/id-token-expired")
      return res.status(401).json({ error: "Verification expired. Please try again." });
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/auth/forgot-password", async (req, res) => {
  const email = isValidEmail(req.body.email);
  if (!email) return res.status(400).json({ error: "Valid email required" });

  const SILENT_OK = { message: "If that email exists, a reset link has been sent." };

  try {
    const result = await pool.query(
      "SELECT id, reset_expires FROM users WHERE email = $1", [email]
    );
    if (result.rows.length === 0) return res.json(SILENT_OK);

    // [FIX 4] Per-user rate limit: reject if a reset was requested < 5 minutes ago.
    // reset_expires is set to NOW()+1h, so if it's still > NOW()+55m it was set <5m ago.
    const { reset_expires } = result.rows[0];
    if (reset_expires && new Date(reset_expires) > new Date(Date.now() + 55 * 60 * 1000)) {
      return res.json(SILENT_OK); // silent reject — no spam
    }

    const userId      = result.rows[0].id;
    const resetToken  = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3",
      [resetToken, resetExpires, userId]
    );

    const resetUrl = `${FRONTEND_URL}/?reset_token=${resetToken}`;
    await transporter.sendMail({
      from: `"Finance Tracker" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#7c3aed;color:#fff;font-size:22px;font-weight:bold;width:48px;height:48px;line-height:48px;border-radius:12px;">$</div>
            <h2 style="margin:12px 0 4px;color:#1e293b;">Finance Tracker</h2>
            <p style="color:#64748b;margin:0;font-size:14px;">Password Reset</p>
          </div>
          <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
            <p style="color:#334155;margin:0 0 8px;">You requested a password reset. Click below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
            <p style="color:#64748b;font-size:13px;margin:0 0 20px;">If you didn't request this, you can safely ignore this email.</p>
            <a href="${resetUrl}" style="display:block;text-align:center;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px;">Reset Password</a>
            <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;text-align:center;">Or copy this link:<br/><span style="color:#7c3aed;">${resetUrl}</span></p>
          </div>
        </div>`,
    });

    res.json(SILENT_OK);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send reset email" });
  }
});

app.post("/auth/reset-password", async (req, res) => {
  const token    = isValidToken(req.body.token);
  const password = trimStr(req.body.password, 128);

  if (!token)    return res.status(400).json({ error: "Invalid or missing reset token" });
  if (!password) return res.status(400).json({ error: "Password required" });

  const pwError = validatePassword(password);
  if (pwError) return res.status(400).json({ error: pwError });

  try {
    // Must fetch first to check same-password constraint
    const lookup = await pool.query(
      "SELECT id, password, reset_expires FROM users WHERE reset_token = $1", [token]
    );
    if (lookup.rows.length === 0)
      return res.status(400).json({ error: "Invalid or expired reset link" });

    const user = lookup.rows[0];
    if (new Date() > new Date(user.reset_expires))
      return res.status(400).json({ error: "Reset link has expired. Please request a new one." });

    if (await bcrypt.compare(password, user.password))
      return res.status(400).json({ error: "Your new password cannot be the same as your old password" });

    const newHash = await bcrypt.hash(password, 10);

    // [FIX 5] Atomically consume token + [FIX 6] increment token_version in one UPDATE
    // This also ensures concurrent requests both fail after the first succeeds.
    await pool.query(
      `UPDATE users
         SET password = $1, reset_token = NULL, reset_expires = NULL,
             token_version = token_version + 1
       WHERE id = $2`,
      [newHash, user.id]
    );

    // [FIX 7] Clear the session cookie — user must re-login with new password
    res.clearCookie("token", { ...COOKIE_OPTS, maxAge: 0 });
    res.json({ message: "Password updated successfully. You can now sign in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ─── Authenticated routes ─────────────────────────────────────────────────────

app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, phone, username, currency FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.put("/auth/profile", authMiddleware, async (req, res) => {
  const username = req.body.username ? trimStr(req.body.username, 50) : null;
  const currency = req.body.currency ? trimStr(req.body.currency, 10) : null;

  if (req.body.username !== undefined && username === null)
    return res.status(400).json({ error: "Username too long (max 50 characters)" });
  if (currency && !VALID_CURRENCIES.has(currency))
    return res.status(400).json({ error: "Invalid currency code" });

  try {
    const result = await pool.query(
      `UPDATE users SET
         username = COALESCE($1, username),
         currency = COALESCE($2, currency)
       WHERE id = $3
       RETURNING id, email, username, currency`,
      [username || null, currency || null, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.get("/auth/check-phone", authMiddleware, async (req, res) => {
  const phone = isValidPhone(req.query.phone);
  if (!phone) return res.status(400).json({ error: "Valid phone number required (E.164 format)" });
  try {
    const existing = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Phone number is already linked to another account" });
    res.json({ available: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Check failed" });
  }
});

app.get("/auth/check-email", authMiddleware, async (req, res) => {
  const email = isValidEmail(req.query.email);
  if (!email) return res.status(400).json({ error: "Valid email required" });
  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Email is already linked to another account" });
    res.json({ available: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Check failed" });
  }
});

app.post("/auth/link-phone", authMiddleware, async (req, res) => {
  if (!admin.apps.length) return res.status(503).json({ error: "SMS not configured on server" });

  const firebaseToken = trimStr(req.body.firebaseToken, 2048);
  const phone         = isValidPhone(req.body.phone);

  if (!firebaseToken) return res.status(400).json({ error: "firebaseToken required" });
  if (!phone)         return res.status(400).json({ error: "Valid phone number required (E.164 format)" });

  try {
    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    if (decoded.phone_number !== phone) return res.status(400).json({ error: "Phone number mismatch" });

    const existing = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Phone already linked to another account" });

    const result = await pool.query(
      "UPDATE users SET phone = $1 WHERE id = $2 RETURNING id, email, phone, username, currency",
      [phone, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to link phone" });
  }
});

app.post("/auth/link-email", authMiddleware, async (req, res) => {
  const email = isValidEmail(req.body.email);
  if (!email) return res.status(400).json({ error: "Valid email required" });

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Email already linked to another account" });

    // [FIX 4] Per-user rate limit for email linking
    const user = await pool.query("SELECT verify_expires FROM users WHERE id = $1", [req.user.id]);
    const ve = user.rows[0]?.verify_expires;
    if (ve && new Date(ve) > new Date(Date.now() + 23 * 60 * 60 * 1000)) {
      return res.status(429).json({ error: "Please wait before requesting another link." });
    }

    const verifyToken   = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      "UPDATE users SET pending_email = $1, verify_token = $2, verify_expires = $3 WHERE id = $4",
      [email, verifyToken, verifyExpires, req.user.id]
    );

    const verifyUrl = `${process.env.BACKEND_URL || "http://localhost:3000"}/auth/link-email/verify?token=${verifyToken}`;
    await transporter.sendMail({
      from: `"Finance Tracker" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Link your email to Finance Tracker",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#7c3aed;color:#fff;font-size:22px;font-weight:bold;width:48px;height:48px;line-height:48px;border-radius:12px;">$</div>
            <h2 style="margin:12px 0 4px;color:#1e293b;">Finance Tracker</h2>
          </div>
          <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
            <p style="color:#334155;margin:0 0 20px;">Click below to link this email to your account. This link expires in <strong>24 hours</strong>.</p>
            <a href="${verifyUrl}" style="display:block;text-align:center;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px;">Link Email</a>
          </div>
        </div>`,
    });
    res.json({ message: "Verification email sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send verification email" });
  }
});

app.get("/auth/link-email/verify", async (req, res) => {
  const token = isValidToken(req.query.token);
  if (!token) return res.status(400).send("Invalid or missing token");

  try {
    const result = await pool.query("SELECT * FROM users WHERE verify_token = $1", [token]);
    if (result.rows.length === 0)
      return res.status(400).send(verifyHtmlPage("Invalid or already used link.", false));

    const user = result.rows[0];
    if (new Date() > new Date(user.verify_expires))
      return res.status(400).send(verifyHtmlPage("Link has expired.", false));
    if (!user.pending_email)
      return res.status(400).send(verifyHtmlPage("No pending email to link.", false));

    await pool.query(
      "UPDATE users SET email = $1, pending_email = NULL, verify_token = NULL, verify_expires = NULL WHERE id = $2",
      [user.pending_email, user.id]
    );
    res.send(verifyHtmlPage("Email linked successfully! You can now sign in with your email.", true));
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ─── Transactions ─────────────────────────────────────────────────────────────

app.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/transactions", authMiddleware, async (req, res) => {
  const description = trimStr(req.body.description, 200) ?? "";
  const amount      = isValidAmount(req.body.amount);
  const type        = trimStr(req.body.type, 20);
  const category    = trimStr(req.body.category, 50);
  const date        = isValidDate(req.body.date);

  if (amount === null)                               return res.status(400).json({ error: "Amount must be a positive number under 1 billion" });
  if (!type || !VALID_TYPES.has(type))               return res.status(400).json({ error: "Type must be 'income' or 'expense'" });
  if (!category || !VALID_CATEGORIES.has(category)) return res.status(400).json({ error: "Invalid category" });
  if (!date)                                         return res.status(400).json({ error: "Valid date required" });

  try {
    const result = await pool.query(
      `INSERT INTO transactions (description, amount, type, category, date, user_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [description, amount, type, category, date, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert error" });
  }
});

app.put("/transactions/:id", authMiddleware, async (req, res) => {
  const id          = isValidId(req.params.id);
  const description = trimStr(req.body.description, 200) ?? "";
  const amount      = isValidAmount(req.body.amount);
  const type        = trimStr(req.body.type, 20);
  const category    = trimStr(req.body.category, 50);

  if (!id)                                           return res.status(400).json({ error: "Invalid transaction ID" });
  if (amount === null)                               return res.status(400).json({ error: "Amount must be a positive number under 1 billion" });
  if (!type || !VALID_TYPES.has(type))               return res.status(400).json({ error: "Type must be 'income' or 'expense'" });
  if (!category || !VALID_CATEGORIES.has(category)) return res.status(400).json({ error: "Invalid category" });

  try {
    const result = await pool.query(
      `UPDATE transactions SET description=$1, amount=$2, type=$3, category=$4
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [description, amount, type, category, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Transaction not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update error" });
  }
});

app.delete("/transactions/:id", authMiddleware, async (req, res) => {
  const id = isValidId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid transaction ID" });

  try {
    const result = await pool.query(
      "DELETE FROM transactions WHERE id=$1 AND user_id=$2 RETURNING *",
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Transaction not found" });
    res.json({ message: "Deleted successfully", deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete error" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
