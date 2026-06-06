// Purpose: Cart route definitions
const express = require('express');
const router = express.Router();
const { addToCart, removeFromCart, getCart, clearCart } = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/add', verifyToken, addToCart);
router.delete('/remove/:itemId', verifyToken, removeFromCart);
router.get('/', verifyToken, getCart);
router.delete('/clear', verifyToken, clearCart);

module.exports = router;
