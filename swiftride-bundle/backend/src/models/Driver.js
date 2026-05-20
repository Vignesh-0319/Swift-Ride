import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: String,
    vehicle: { type: String, enum: ["economy", "premium", "xl"], default: "economy" },
    plate: String,
    rating: { type: Number, default: 4.8 },
    online: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    heading: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

DriverSchema.index({ location: "2dsphere" });

export default mongoose.model("Driver", DriverSchema);
