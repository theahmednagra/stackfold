import crypto from "crypto";

// Helper function to generate a secure 6-digit verification code and a 15-minute expiry window
export function generateVerificationData() {
    const code = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    return { code, expiry };
}