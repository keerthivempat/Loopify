// Purpose: Public stats endpoint — no auth required
const express = require('express');
const router  = express.Router();
const Item     = require('../models/Item');
const User     = require('../models/User');
const Wishlist = require('../models/Wishlist');

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const [listings, users, wishlistSavers] = await Promise.all([
      Item.countDocuments({ status: 'available' }),
      User.countDocuments({}),
      // count distinct users who have at least one wishlist entry
      Wishlist.distinct('userId').then(ids => ids.length),
    ]);

    res.json({ listings, users, wishlistSavers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
