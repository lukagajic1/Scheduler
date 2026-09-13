const bcrypt = require("bcrypt");
const pool = require("./db");

async function seedDemoUser() {
  try {
    const email = process.env.DEMO_EMAIL;
    const password = process.env.DEMO_PASSWORD;

    if (!email || !password) {
      throw new Error("DEMO_EMAIL and DEMO_PASSWORD must be set in .env");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
        INSERT INTO users (email, password_hash)
        VALUES ($1, $2)
        ON CONFLICT (email)
        DO UPDATE SET password_hash = EXCLUDED.password_hash
        RETURNING id, email
      `,
      [email.toLowerCase(), passwordHash]
    );

    console.log("Demo user created:", result.rows[0].email);
  } catch (error) {
    console.error("Could not create demo user:", error.message);
  } finally {
    await pool.end();
  }
}

seedDemoUser();