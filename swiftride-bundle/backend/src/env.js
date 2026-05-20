import "dotenv/config";

const required = ["MONGO_URI", "JWT_SECRET"];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`[env] Missing required env var: ${k}`);
    process.exit(1);
  }
}

export const env = {
  PORT: Number(process.env.PORT || 4000),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "*",
  OTP_PROVIDER: process.env.OTP_PROVIDER || "",
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
  TWILIO_FROM: process.env.TWILIO_FROM || "",
};
