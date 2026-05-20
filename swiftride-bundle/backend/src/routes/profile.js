import { Router } from "express";
import { z } from "zod";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub).select("-otpHash -otpExpiresAt");
  res.json({ user });
});

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  email: z.string().email().max(200).optional(),
  avatarUrl: z.string().url().max(500).optional(),
});

router.patch("/", requireAuth, validate(updateSchema), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.sub, req.body, { new: true })
    .select("-otpHash -otpExpiresAt");
  res.json({ user });
});

export default router;
