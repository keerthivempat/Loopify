// Purpose: OTP generation and verification utilities
const bcrypt = require('bcryptjs');

const generateOtp = async () => {
  const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(plainOtp, 10);
  return { plainOtp, hashedOtp };
};

const verifyOtp = async (plainOtp, hashed) => {
  return bcrypt.compare(plainOtp, hashed);
};

module.exports = { generateOtp, verifyOtp };
