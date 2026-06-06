// Purpose: Verify Google reCAPTCHA token
require('dotenv').config();

const verifyRecaptcha = async (token) => {
  const secretKey = process.env.RECAPTCHA_SECRET || '6LcqOssqAAAAALKFELb6uZr2viccmeuy6wWl1p8U';
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  const response = await fetch(verifyUrl, { method: 'POST' });
  const data = await response.json();
  return data.success;
};

module.exports = { verifyRecaptcha };
