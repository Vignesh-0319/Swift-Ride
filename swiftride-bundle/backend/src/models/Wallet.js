import mongoose from "mongoose";

const TxnSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["topup", "ride", "refund"], required: true },
    amount: { type: Number, required: true },
    note: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const WalletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0 },
    transactions: { type: [TxnSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", WalletSchema);
