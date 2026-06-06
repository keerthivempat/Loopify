// Purpose: Inquiry route definitions
const express = require('express');
const router  = express.Router();
const {
  createInquiry,
  getSellerInquiries,
  getBuyerInquiries,
  acceptInquiry,
  rejectInquiry,
} = require('../controllers/inquiryController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/',                  verifyToken, createInquiry);
router.get('/seller',             verifyToken, getSellerInquiries);
router.get('/buyer',              verifyToken, getBuyerInquiries);
router.patch('/:id/accept',       verifyToken, acceptInquiry);
router.patch('/:id/reject',       verifyToken, rejectInquiry);

module.exports = router;
