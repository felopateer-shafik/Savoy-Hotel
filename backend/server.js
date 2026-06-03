// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { initializeDatabase } = require("./utils/databaseInit");
const scheduledTasks = require("./utils/scheduledTasks");

const app = express();

app.set("trust proxy", 1);

const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

const isOriginAllowed = (origin) => {
  // In development, allow all origins
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (!origin) {
    return true; // same-origin / server-to-server
  }

  if (allowedOrigins.includes("*")) {
    return true;
  }

  const normalizedOrigin = (() => {
    try {
      const { protocol, hostname, port } = new URL(origin);
      return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
    } catch (error) {
      return origin;
    }
  })();

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  // Allow matching by host when the configured value omits a port (e.g. http://localhost)
  try {
    const { protocol, hostname } = new URL(normalizedOrigin);
    return allowedOrigins.some((allowed) => {
      try {
        const url = new URL(allowed);
        return (
          url.protocol === protocol && url.hostname === hostname && !url.port
        );
      } catch (error) {
        return false;
      }
    });
  } catch (error) {
    return false;
  }
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 600),
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      console.warn(`CORS blocked request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);

// Simple health-check endpoint
app.get("/api/health-check", (req, res) => {
  res.sendStatus(200);
});

// ─── Mount API Routes ────────────────────────────────────────
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  let status = err.status || 500;
  if (err.message === "Not allowed by CORS") {
    status = 403;
  }
  res.status(status).json({
    message: status === 500 ? "Server error" : err.message,
  });
});

// ─── Start & Initialize ──────────────────────────────────────
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log("✅ Database initialized");

    scheduledTasks.start();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
