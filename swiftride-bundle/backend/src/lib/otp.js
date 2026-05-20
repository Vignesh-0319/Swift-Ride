import { env } from "../env.js";

// Dev stub: always "123456" unless OTP_PROVIDER is configured.
// Swap in Twilio / MSG91 here for production.
export function generateOtp() {
  if (!env.OTP_PROVIDER) return "123456";
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendOtp(phone, code) {
  if (!env.OTP_PROVIDER) {
    console.log(`[otp] (dev) phone=${phone} code=${code}`);
    return { sent: true, dev: true };
  }
  // TODO: integrate Twilio / MSG91 here
  console.log(`[otp] (${env.OTP_PROVIDER}) phone=${phone} code=${code}`);
  return { sent: true };
}
