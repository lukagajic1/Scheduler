const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

router.post("/login", async (request, response) => {
  try {
    const { email, password, rememberMe } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Email and password are required.",
      });
    }

    const result = await pool.query(
      `
        SELECT id, email, password_hash
        FROM users
        WHERE email = $1
      `,
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    if (!user) {
      return response.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return response.status(401).json({
        message: "Invalid email or password.",
      });
    }

    request.session.user = {
      id: user.id,
      email: user.email,
    };

    request.session.cookie.maxAge =
      rememberMe === true
        ? 30 * 24 * 60 * 60 * 1000
        : null;

    response.json({
      message: "Login successful.",
      user: request.session.user,
    });
  } catch (error) {
    console.error("Login error:", error);

    response.status(500).json({
      message: "Unable to log in.",
    });
  }
});

router.get("/session", (request, response) => {
  if (!request.session.user) {
    return response.json({
      authenticated: false,
    });
  }

  response.json({
    authenticated: true,
    user: request.session.user,
  });
});

router.post("/logout", (request, response) => {
  request.session.destroy((error) => {
    if (error) {
      return response.status(500).json({
        message: "Unable to log out.",
      });
    }

    response.clearCookie("connect.sid");

    response.json({
      message: "Logout successful.",
    });
  });
});

module.exports = router;