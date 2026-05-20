import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    from: { type: String, enum: ["user", "agent"], required: true },
    text: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const SupportTicketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ["open", "pending", "closed"], default: "open" },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("SupportTicket", SupportTicketSchema);
