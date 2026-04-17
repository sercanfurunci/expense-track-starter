// Required SQL migrations:
// CREATE TABLE users (
//   id SERIAL PRIMARY KEY,
//   email VARCHAR(255) UNIQUE NOT NULL,
//   password TEXT NOT NULL,
//   is_verified BOOLEAN DEFAULT FALSE,
//   verify_token TEXT,
//   verify_expires TIMESTAMP,
//   reset_token TEXT,
//   reset_expires TIMESTAMP,
//   created_at TIMESTAMP DEFAULT NOW()
// );
// -- OR if table already exists, run:
// ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_token TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_expires TIMESTAMP;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP;
// ALTER TABLE transactions ADD COLUMN user_id INTEGER REFERENCES users(id);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!JWT_SECRET || !ADMIN_SECRET) {
  console.error("Missing JWT_SECRET or ADMIN_SECRET in .env — server stopped.");
  process.exit(1);
}

if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  console.error("Missing MAIL_USER or MAIL_PASS in .env — server stopped.");
  process.exit(1);
}

app.use(cors({
  origin: "http://localhost:5173",
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense Tracker API",
      version: "1.0.0",
      description: "Transactions API",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./server.js"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false },
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     parameters:
 *       - in: header
 *         name: x-admin-secret
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Forbidden
 */
app.get("/admin/users", async (req, res) => {
  if (req.headers["x-admin-secret"] !== ADMIN_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

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

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user (sends verification email)
 */
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(
      `INSERT INTO users (email, password, is_verified, verify_token, verify_expires)
       VALUES ($1, $2, FALSE, $3, $4)`,
      [email, password_hash, verifyToken, verifyExpires]
    );

    const verifyUrl = `http://localhost:3000/auth/verify?token=${verifyToken}`;

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
            <a href="${verifyUrl}" style="display:block;text-align:center;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px;">
              Verify Email
            </a>
            <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;text-align:center;">
              Or copy this link: <br/><span style="color:#7c3aed;">${verifyUrl}</span>
            </p>
          </div>
        </div>
      `,
    });

    res.status(201).json({ message: "Verification email sent. Please check your inbox." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * @openapi
 * /auth/verify:
 *   get:
 *     summary: Verify email with token from email link
 */
app.get("/auth/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE verify_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).send(verifyHtmlPage("Invalid or already used verification link.", false));
    }

    const user = result.rows[0];

    if (new Date() > new Date(user.verify_expires)) {
      return res.status(400).send(verifyHtmlPage("Verification link has expired. Please register again.", false));
    }

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
  const icon = success ? "✓" : "✕";
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Email Verification</title></head>
    <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;">
      <div style="text-align:center;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px 48px;max-width:400px;">
        <div style="width:56px;height:56px;border-radius:50%;background:${color}22;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;color:${color};">${icon}</div>
        <div style="font-size:24px;font-weight:bold;color:#fff;margin-bottom:8px;">Finance Tracker</div>
        <p style="color:#94a3b8;margin:0 0 24px;">${message}</p>
        <a href="http://localhost:5173" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:10px 28px;border-radius:10px;font-weight:600;">Go to App</a>
      </div>
    </body>
    </html>
  `;
}

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 */
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * @openapi
 * /transactions:
 *   get:
 *     summary: Get all transactions for the authenticated user
 */
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

/**
 * @openapi
 * /transactions:
 *   post:
 *     summary: Create a transaction
 */
app.post("/transactions", authMiddleware, async (req, res) => {
  const { description, amount, type, category, date } = req.body;

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

/**
 * @openapi
 * /transactions/{id}:
 *   put:
 *     summary: Update a transaction
 */
app.put("/transactions/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { description, amount, type, category } = req.body;

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET description=$1, amount=$2, type=$3, category=$4
       WHERE id=$5 AND user_id=$6
       RETURNING *`,
      [description, amount, type, category, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update error" });
  }
});

/**
 * @openapi
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 */
app.delete("/transactions/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM transactions WHERE id=$1 AND user_id=$2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json({ message: "Deleted successfully", deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete error" });
  }
});

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 */
app.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    // Always respond OK to avoid email enumeration
    if (result.rows.length === 0) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const userId = result.rows[0].id;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3",
      [resetToken, resetExpires, userId]
    );

    const resetUrl = `http://localhost:5173/?reset_token=${resetToken}`;

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
            <p style="color:#334155;margin:0 0 8px;">You requested a password reset. Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
            <p style="color:#64748b;font-size:13px;margin:0 0 20px;">If you didn't request this, you can safely ignore this email.</p>
            <a href="${resetUrl}" style="display:block;text-align:center;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px;">
              Reset Password
            </a>
            <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;text-align:center;">
              Or copy this link: <br/><span style="color:#7c3aed;">${resetUrl}</span>
            </p>
          </div>
        </div>
      `,
    });

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send reset email" });
  }
});

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token from email
 */
app.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "Token and password required" });

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    const user = result.rows[0];

    if (new Date() > new Date(user.reset_expires)) {
      return res.status(400).json({ error: "Reset link has expired. Please request a new one." });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: "Your new password cannot be the same as your old password" });
    }

    const newHash = await bcrypt.hash(password, 10);
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2",
      [newHash, user.id]
    );

    res.json({ message: "Password updated successfully. You can now sign in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
