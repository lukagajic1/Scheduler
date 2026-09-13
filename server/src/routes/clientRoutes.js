const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// Get all clients
router.get("/", async (request, response) => {
  try {
    const result = await pool.query(`
      SELECT id, name, address, phone_number, created_at
      FROM clients
      ORDER BY name
    `);

    response.json({
      clients: result.rows,
    });
  } catch (error) {
    console.error("Get clients error:", error);

    response.status(500).json({
      message: "Unable to retrieve clients.",
    });
  }
});

// Create a client
router.post("/", async (request, response) => {
  try {
    const { name, address, phoneNumber } = request.body;

    if (!name?.trim() || !address?.trim() || !phoneNumber?.trim()) {
      return response.status(400).json({
        message: "Name, address, and phone number are required.",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO clients (name, address, phone_number)
        VALUES ($1, $2, $3)
        RETURNING id, name, address, phone_number, created_at
      `,
      [name.trim(), address.trim(), phoneNumber.trim()],
    );

    response.status(201).json({
      client: result.rows[0],
    });
  } catch (error) {
    console.error("Create client error:", error);

    response.status(500).json({
      message: "Unable to create client.",
    });
  }
});

// Edit a client
router.patch("/:id", async (request, response) => {
  try {
    const { name, address, phoneNumber } = request.body;

    if (!name?.trim() || !address?.trim() || !phoneNumber?.trim()) {
      return response.status(400).json({
        message: "Name, address, and phone number are required.",
      });
    }

    const result = await pool.query(
      `
        UPDATE clients
        SET
          name = $1,
          address = $2,
          phone_number = $3
        WHERE id = $4
        RETURNING id, name, address, phone_number, created_at
      `,
      [name.trim(), address.trim(), phoneNumber.trim(), request.params.id],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "Client not found.",
      });
    }

    response.json({
      client: result.rows[0],
    });
  } catch (error) {
    console.error("Update client error:", error);

    response.status(500).json({
      message: "Unable to update client.",
    });
  }
});

// Delete a client
router.delete("/:id", async (request, response) => {
  try {
    const result = await pool.query(
      `
        DELETE FROM clients
        WHERE id = $1
        RETURNING id
      `,
      [request.params.id],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "Client not found.",
      });
    }

    response.json({
      message: "Client deleted.",
    });
  } catch (error) {
    console.error("Delete client error:", error);

    response.status(500).json({
      message: "Unable to delete client.",
    });
  }
});

module.exports = router;
