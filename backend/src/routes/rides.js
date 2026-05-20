import { Router } from "express";
import { z } from "zod";
import Ride from "../models/Ride.js";
import Driver from "../models/Driver.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { haversineKm, estimateFare, VEHICLES } from "../lib/geo.js";

const router = Router();

const point = z.object({
  address: z.string().min(1).max(300),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const estimateSchema = z.object({
  pickup: point,
  drop: point,
  vehicle: z.enum(VEHICLES).default("economy"),
});

router.post("/estimate", requireAuth, validate(estimateSchema), (req, res) => {
  const { pickup, drop, vehicle } = req.body;
  const km = haversineKm(pickup, drop);
  res.json(estimateFare(km, vehicle));
});

const createSchema = estimateSchema.extend({
  paymentMethod: z.enum(["cash", "wallet", "card"]).default("cash"),
});

router.post("/", requireAuth, validate(createSchema), async (req, res) => {
  const { pickup, drop, vehicle, paymentMethod } = req.body;
  const km = haversineKm(pickup, drop);
  const { fare } = estimateFare(km, vehicle);
  const ride = await Ride.create({
    riderId: req.user.sub,
    pickup, drop, vehicle, paymentMethod,
    distanceKm: Number(km.toFixed(2)),
    fare,
    status: "requested",
  });

  // Auto-assign nearest online driver of matching tier (best-effort)
  const driver = await Driver.findOne({
    online: true, vehicle,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [pickup.lng, pickup.lat] },
        $maxDistance: 10_000,
      },
    },
  });
  if (driver) {
    ride.driverId = driver._id;
    ride.status = "accepted";
    await ride.save();
  }
  res.status(201).json({ ride });
});

router.get("/", requireAuth, async (req, res) => {
  const rides = await Ride.find({ riderId: req.user.sub })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ rides });
});

router.get("/:id", requireAuth, async (req, res) => {
  const ride = await Ride.findOne({ _id: req.params.id, riderId: req.user.sub })
    .populate("driverId");
  if (!ride) return res.status(404).json({ error: "Not found" });
  res.json({ ride });
});

router.patch("/:id/cancel", requireAuth, async (req, res) => {
  const ride = await Ride.findOneAndUpdate(
    { _id: req.params.id, riderId: req.user.sub, status: { $in: ["requested", "accepted", "arriving"] } },
    { status: "cancelled" },
    { new: true }
  );
  if (!ride) return res.status(400).json({ error: "Cannot cancel" });
  res.json({ ride });
});

export default router;
