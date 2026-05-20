import { Router } from "express";
import { z } from "zod";
import SupportTicket from "../models/SupportTicket.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/tickets", requireAuth, async (req, res) => {
  const tickets = await SupportTicket.find({ userId: req.user.sub })
    .sort({ updatedAt: -1 });
  res.json({ tickets });
});

const createSchema = z.object({
  subject: z.string().min(2).max(200),
  message: z.string().min(2).max(2000),
});

router.post("/tickets", requireAuth, validate(createSchema), async (req, res) => {
  const { subject, message } = req.body;
  const ticket = await SupportTicket.create({
    userId: req.user.sub,
    subject,
    messages: [{ from: "user", text: message }],
  });
  res.status(201).json({ ticket });
});

const replySchema = z.object({ text: z.string().min(1).max(2000) });

router.post("/tickets/:id/reply", requireAuth, validate(replySchema), async (req, res) => {
  const ticket = await SupportTicket.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.sub },
    { $push: { messages: { from: "user", text: req.body.text } }, status: "pending" },
    { new: true }
  );
  if (!ticket) return res.status(404).json({ error: "Not found" });
  res.json({ ticket });
});

export default router;
