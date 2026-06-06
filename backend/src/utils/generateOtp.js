// Purpose: small wrapper to create OTP (delegates to otpService)
const { generateOtp } = require('../services/otpService');
module.exports = generateOtp;
