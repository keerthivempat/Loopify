// Purpose: Routes for the logged-in user's own listings
const express = require('express');
const router = express.Router();
const { getMyListings } = require('../controllers/itemController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getMyListings);

module.exports = router;
