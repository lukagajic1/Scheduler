const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const pool = require("./db");

const PostgreSQLStore = require("connect-pg-simple")(session);

const app = express();
const PORT = process.env.PORT || 5000;

let clientUrl = "http://localhost:5173";
let secureCookie = false;
let sameSiteSetting = "lax";

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);

  secureCookie = true;
  sameSiteSetting = "none";

  if (process.env.CLIENT_URL) {
    clientUrl = process.env.CLIENT_URL;
  }
}

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    store: new PostgreSQLStore({
      pool: pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: secureCookie,
      sameSite: sameSiteSetting,
    },
  }),
);

app.get("/", function (request, response) {
  response.json({
    message: "Scheduler API is running",
  });
});

app.get("/api/health", function (request, response) {
  response.json({
    message: "Scheduler server is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/appointments", appointmentRoutes);

app.listen(PORT, function () {
  console.log(`Scheduler server running on port ${PORT}`);
});
