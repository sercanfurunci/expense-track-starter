require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function run() {
  await pool.query("DELETE FROM transactions WHERE user_id IN (SELECT id FROM users)");
  await pool.query("DELETE FROM users");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_token TEXT");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_expires TIMESTAMP");
  console.log("Done: columns added, users cleared.");
  await pool.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
