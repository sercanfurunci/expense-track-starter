const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(cors());
app.use(express.json());
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense Tracker API",
      version: "1.0.0",
      description: "Transactions API",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Docker PostgreSQL bağlantısı
const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "expenses",
  password: "1234",
  port: 5433, 
});


// TEST endpoint
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

/**
 * @openapi
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     responses:
 *       200:
 *         description: List of transactions
 */
// transactions GET
app.get("/transactions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB hatası" });
  }
});

/**
 * @openapi
 * /transactions:
 *   post:
 *     summary: Create transaction
 */
//transactions POST
app.post("/transactions", async (req, res) => {
  const { description, amount, type, category, date } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO transactions (description, amount, type, category, date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [description, amount, type, category, date]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert hatası" });
  }
});

/**
 * @openapi
 * /transactions/{id}:
 *   put:
 *     summary: Update transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Updated transaction
 */
//transactions PUT
app.put("/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const { description, amount, type, category } = req.body;

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET description=$1,
           amount=$2,
           type=$3,
           category=$4
       WHERE id=$5
       RETURNING *`,
      [description, amount, type, category, id]
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
 *     summary: Delete transaction
 */
//transactions DELETE
app.delete("/transactions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 RETURNING *",
      [id]
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


// server start
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});