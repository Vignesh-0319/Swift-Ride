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
    origin:
      env.CLIENT_ORIGIN === "*"
        ? true
        : env.CLIENT_ORIGIN.split(","),
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/api/", rateLimit({ windowMs: 60000, max: 120 }));

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "swiftride-api" })
);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/support", supportRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin:
      env.CLIENT_ORIGIN === "*"
        ? true
        : env.CLIENT_ORIGIN.split(","),
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Missing token"));
    }

    socket.user = jwt.verify(token, env.JWT_SECRET);

    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  socket.on("driver:location", ({ rideId, lat, lng, heading }) => {
    if (!rideId) return;

    io.to(`ride:${rideId}`).emit("driver:location", {
      lat,
      lng,
      heading,
      ts: Date.now(),
    });
  });

  socket.on("ride:join", ({ rideId }) => {
    if (rideId) {
      socket.join(`ride:${rideId}`);
    }
  });
});

(async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    console.log(`[swiftride-api] listening on :${env.PORT}`);
  });
})();