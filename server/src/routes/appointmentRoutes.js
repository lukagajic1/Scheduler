const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (request, response) => {
  try {
    const { from, to } = request.query;

    let query = `
      SELECT
        appointments.id,
        appointments.client_id,
        appointments.start_time,
        appointments.end_time,
        clients.name AS client_name,
        clients.address,
        clients.phone_number
      FROM appointments
      JOIN clients
        ON clients.id = appointments.client_id
    `;

    const values = [];

    if (from && to) {
      query += `
        WHERE appointments.start_time >= $1
          AND appointments.start_time < $2
      `;

      values.push(from, to);
    }

    query += " ORDER BY appointments.start_time";

    const result = await pool.query(query, values);

    response.json({
      appointments: result.rows,
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    response.status(500).json({
      message: "Unable to retrieve appointments.",
    });
  }
});

router.post("/", async (request, response) => {
  try {
    const { clientId, startTime, endTime } = request.body;

    const clientIdNumber = Number(clientId);
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      !Number.isInteger(clientIdNumber) ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return response.status(400).json({
        message: "A client and valid appointment times are required.",
      });
    }

    const clientResult = await pool.query(
      `
        SELECT id
        FROM clients
        WHERE id = $1
      `,
      [clientIdNumber],
    );

    if (clientResult.rows.length === 0) {
      return response.status(404).json({
        message: "Client not found.",
      });
    }

    const conflictResult = await pool.query(
      `
        SELECT id
        FROM appointments
        WHERE start_time < $2
          AND end_time > $1
        LIMIT 1
      `,
      [start.toISOString(), end.toISOString()],
    );

    if (conflictResult.rows.length > 0) {
      return response.status(409).json({
        message: "That time overlaps an existing appointment.",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO appointments (
          client_id,
          start_time,
          end_time
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          client_id,
          start_time,
          end_time,
          created_at
      `,
      [clientIdNumber, start.toISOString(), end.toISOString()],
    );

    response.status(201).json({
      appointment: result.rows[0],
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    response.status(500).json({
      message: "Unable to create appointment.",
    });
  }
});

router.patch("/:id", async (request, response) => {
  try {
    const appointmentId = Number(request.params.id);
    const { clientId, startTime, endTime } = request.body;

    const clientIdNumber = Number(clientId);
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      !Number.isInteger(appointmentId) ||
      !Number.isInteger(clientIdNumber) ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return response.status(400).json({
        message: "A client and valid appointment times are required.",
      });
    }

    const appointmentResult = await pool.query(
      `
        SELECT id
        FROM appointments
        WHERE id = $1
      `,
      [appointmentId],
    );

    if (appointmentResult.rows.length === 0) {
      return response.status(404).json({
        message: "Appointment not found.",
      });
    }

    const clientResult = await pool.query(
      `
        SELECT id
        FROM clients
        WHERE id = $1
      `,
      [clientIdNumber],
    );

    if (clientResult.rows.length === 0) {
      return response.status(404).json({
        message: "Client not found.",
      });
    }

    const conflictResult = await pool.query(
      `
        SELECT id
        FROM appointments
        WHERE id <> $3
          AND start_time < $2
          AND end_time > $1
        LIMIT 1
      `,
      [start.toISOString(), end.toISOString(), appointmentId],
    );

    if (conflictResult.rows.length > 0) {
      return response.status(409).json({
        message: "That time overlaps an existing appointment.",
      });
    }

    const result = await pool.query(
      `
        UPDATE appointments
        SET
          client_id = $1,
          start_time = $2,
          end_time = $3
        WHERE id = $4
        RETURNING
          id,
          client_id,
          start_time,
          end_time
      `,
      [clientIdNumber, start.toISOString(), end.toISOString(), appointmentId],
    );

    response.json({
      message: "Appointment updated.",
      appointment: result.rows[0],
    });
  } catch (error) {
    console.error("Update appointment error:", error);

    response.status(500).json({
      message: "Unable to update appointment.",
    });
  }
});

router.delete("/:id", async (request, response) => {
  try {
    const appointmentId = Number(request.params.id);

    if (!Number.isInteger(appointmentId)) {
      return response.status(400).json({
        message: "Invalid appointment ID.",
      });
    }

    const result = await pool.query(
      `
        DELETE FROM appointments
        WHERE id = $1
        RETURNING id
      `,
      [appointmentId],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "Appointment not found.",
      });
    }

    response.json({
      message: "Appointment deleted.",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);

    response.status(500).json({
      message: "Unable to delete appointment.",
    });
  }
});

module.exports = router;
