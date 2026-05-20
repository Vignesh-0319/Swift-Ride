import { Router } from "express";
import { z } from "zod";
import Driver from "../models/Driver.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const nearbySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  vehicle: z.enum(["economy", "premium", "xl"]).optional(),
  radius: z.coerce.number().min(100).max(50000).default(5000),
});

router.get("/nearby", requireAuth, validate(nearbySchema, "query"), async (req, res) => {
  const { lat, lng, vehicle, radius } = req.query;
  const q = {
    online: true,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radius,
      },
    },
  };
  if (vehicle) q.vehicle = vehicle;
  const drivers = await Driver.find(q).limit(20);
  res.json({ drivers });
});

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360).optional(),
  online: z.boolean().optional(),
});

router.post("/location", requireAuth, validate(locationSchema), async (req, res) => {
  const { lat, lng, heading, online } = req.body;
  const update = {
    location: { type: "Point", coordinates: [lng, lat] },
    updatedAt: new Date(),
  };
  if (heading !== undefined) update.heading = heading;
  if (online !== undefined) update.online = online;
  const driver = await Driver.findOneAndUpdate(
    { userId: req.user.sub },
    { $set: update, $setOnInsert: { userId: req.user.sub } },
    { upsert: true, new: true }
  );
  res.json({ driver });
});

export default router;
