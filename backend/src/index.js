import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";

import { env } from "./env.js";
import { connectDB } from "./db.js";
import { notFound, errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import rideRoutes from "./routes/rides.js";
import driverRoutes from "./routes/drivers.js";
import walletRoutes from "./routes/wallet.js";
import supportRoutes from "./routes/support.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN === "*" ? true : env.CLIENT_ORIGIN.split(","),
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// UPDATED: Global rate limiter now covers the root path
app.use("/", rateLimit({ windowMs: 60000, max: 120 }));

// UPDATED: Health check route now at /health
app.get("/health", (_req, res) =>
  res.json({ ok: true, service: "swiftride-api" })
);

// UPDATED: Routes mounted directly on the root
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/rides", rideRoutes);
app.use("/drivers", driverRoutes);
app.use("/wallet", walletRoutes);
app.use("/support", supportRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

// Initialize DB and Start Server
connectDB().then(() => {
  server.listen(env.PORT, () => {
    console.log(`[server] running on port ${env.PORT}`);
  });
});

const io = new SocketServer(server, {
  cors: {
    origin: env.CLIENT_ORIGIN === "*" ? true : env.CLIENT_ORIGIN.split(","),
  },
});

// ... Keep your existing io.use and io.on logic below ...
