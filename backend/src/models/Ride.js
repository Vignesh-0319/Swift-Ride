import mongoose from "mongoose";

const RideSchema = new mongoose.Schema(
  {
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
    pickup: {
      address: String,
      lat: Number,
      lng: Number,
    },
    drop: {
      address: String,
      lat: Number,
      lng: Number,
    },
    vehicle: { type: String, enum: ["economy", "premium", "xl"], default: "economy" },
    distanceKm: Number,
    fare: Number,
    status: {
      type: String,
      enum: ["requested", "accepted", "arriving", "in_progress", "completed", "cancelled"],
      default: "requested",
      index: true,
    },
    paymentMethod: { type: String, enum: ["cash", "wallet", "card"], default: "cash" },
  },
  { timestamps: true }
);

export default mongoose.model("Ride", RideSchema);
