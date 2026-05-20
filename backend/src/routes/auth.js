import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import { generateOtp, sendOtp } from "../lib/otp.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// --- EXISTING LOGIC ---
const phoneSchema = z.object({ phone: z.string().min(8).max(20).regex(/^\+?[0-9]+$/) });
const verifySchema = z.object({ phone: z.string().min(8).max(20), code: z.string().length(6) });

router.post("/request-otp", validate(phoneSchema), async (req, res) => {
  const { phone } = req.body;
  const code = generateOtp();
  const otpHash = await bcrypt.hash(code, 8);
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await User.findOneAndUpdate({ phone }, { phone, otpHash, otpExpiresAt }, { upsert: true, new: true });
  await sendOtp(phone, code);
  res.json({ ok: true, devCode: process.env.OTP_PROVIDER ? undefined : code });
});

router.post("/verify-otp", validate(verifySchema), async (req, res) => {
  const { phone, code } = req.body;
  const user = await User.findOne({ phone });
  if (!user || !user.otpHash || !user.otpExpiresAt) return res.status(400).json({ error: "Request a new code" });
  if (user.otpExpiresAt < new Date()) return res.status(400).json({ error: "Code expired" });
  const ok = await bcrypt.compare(code, user.otpHash);
  if (!ok) return res.status(400).json({ error: "Invalid code" });
  user.otpHash = null; user.otpExpiresAt = null; user.lastLoginAt = new Date();
  await user.save();
  await Wallet.findOneAndUpdate({ userId: user._id }, { $setOnInsert: { balance: 0, transactions: [] } }, { upsert: true });
  const token = signToken({ sub: user._id.toString(), phone: user.phone });
  res.json({ token, user: publicUser(user) });
});

// --- NEW ALIAS ROUTES (FIXES THE 404) ---
router.post("/register", (req, res) => res.redirect(307, "/api/auth/request-otp"));
router.post("/login", (req, res) => res.redirect(307, "/api/auth/verify-otp"));

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ user: publicUser(user) });
});

function publicUser(u) {
  return { id: u._id, phone: u.phone, name: u.name, email: u.email, avatarUrl: u.avatarUrl, role: u.role };
}

export default router;
