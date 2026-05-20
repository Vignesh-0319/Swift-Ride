import { Router } from "express";
import { z } from "zod";
import Wallet from "../models/Wallet.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const wallet = await Wallet.findOneAndUpdate(
    { userId: req.user.sub },
    { $setOnInsert: { balance: 0, transactions: [] } },
    { upsert: true, new: true }
  );
  res.json({ wallet });
});

const topupSchema = z.object({
  amount: z.number().min(1).max(10000),
  note: z.string().max(120).optional(),
});

router.post("/topup", requireAuth, validate(topupSchema), async (req, res) => {
  const { amount, note } = req.body;
  const wallet = await Wallet.findOneAndUpdate(
    { userId: req.user.sub },
    {
      $inc: { balance: amount },
      $push: { transactions: { type: "topup", amount, note: note || "Wallet top-up" } },
      $setOnInsert: { userId: req.user.sub },
    },
    { upsert: true, new: true }
  );
  res.json({ wallet });
});

export default router;
