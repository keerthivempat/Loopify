// Purpose: Order route definitions
const express = require('express');
const router  = express.Router();
const {
  placeOrders,
  getBuyerOrders,
  getSellerOrders,
  completeOrder,
  regenerateOtp,
  acceptOrder,
  rejectOrder,
} = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/place',                    verifyToken, placeOrders);
router.get('/buyer',                     verifyToken, getBuyerOrders);
router.get('/seller',                    verifyToken, getSellerOrders);
router.post('/complete',                 verifyToken, completeOrder);
router.post('/regenerate-otp/:orderId',  verifyToken, regenerateOtp);
router.patch('/:id/accept',              verifyToken, acceptOrder);
router.patch('/:id/reject',              verifyToken, rejectOrder);

module.exports = router;
