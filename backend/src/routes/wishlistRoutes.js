// Purpose: Wishlist route definitions
const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getWishlist);
router.post('/:itemId', verifyToken, addToWishlist);
router.delete('/:itemId', verifyToken, removeFromWishlist);

module.exports = router;
