import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import User from "../models/User.js";
import Driver from "../models/Driver.js";

const center = { lat: 40.7128, lng: -74.006 }; // NYC

async function run() {
  await connectDB();
  console.log("[seed] clearing demo drivers...");
  await Driver.deleteMany({});
  const samples = [
    { name: "Alex P.", vehicle: "economy", plate: "NYC-1023" },
    { name: "Maria K.", vehicle: "premium", plate: "NYC-7741" },
    { name: "Sam D.",   vehicle: "xl",      plate: "NYC-9912" },
    { name: "Lin O.",   vehicle: "economy", plate: "NYC-3320" },
  ];
  for (const [i, s] of samples.entries()) {
    const u = await User.findOneAndUpdate(
      { phone: `+1555000010${i}` },
      { phone: `+1555000010${i}`, name: s.name, role: "driver" },
      { upsert: true, new: true }
    );
    const lng = center.lng + (Math.random() - 0.5) * 0.04;
    const lat = center.lat + (Math.random() - 0.5) * 0.04;
    await Driver.create({
      userId: u._id, name: s.name, vehicle: s.vehicle, plate: s.plate,
      online: true, rating: 4.7 + Math.random() * 0.3,
      location: { type: "Point", coordinates: [lng, lat] },
    });
  }
  console.log("[seed] done");
  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });
