// Purpose: Wishlist controllers
const Wishlist = require('../models/Wishlist');
const Item = require('../models/Item');
const mongoose = require('mongoose');

const transformItem = (item) => ({
  _id: item._id,
  name: item.name,
  description: item.description,
  price: item.price,
  category: item.category,
  imageUrl: item.imageUrl || item.images?.[0],
  images: item.images?.length ? item.images : item.imageUrl ? [item.imageUrl] : [],
  stockQuantity: item.stockQuantity,
  status: item.status || 'available',
  sellerId: item.sellerId?._id || item.sellerId,
  createdAt: item.createdAt,
  vendorName: item.sellerId?.firstName
    ? `${item.sellerId.firstName} ${item.sellerId.lastName}`
    : 'Unknown Vendor',
});

const addToWishlist = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const existing = await Wishlist.findOne({ userId: req.user.id, itemId });
    if (existing) return res.status(400).json({ message: 'Item already in wishlist' });

    const entry = new Wishlist({ userId: req.user.id, itemId });
    await entry.save();

    res.status(201).json({ message: 'Added to wishlist', itemId });
  } catch (err) {
    next(err);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    const result = await Wishlist.findOneAndDelete({ userId: req.user.id, itemId });
    if (!result) return res.status(404).json({ message: 'Item not in wishlist' });

    res.json({ message: 'Removed from wishlist', itemId });
  } catch (err) {
    next(err);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const entries = await Wishlist.find({ userId: req.user.id })
      .populate({
        path: 'itemId',
        populate: { path: 'sellerId', select: 'firstName lastName' },
      })
      .sort({ createdAt: -1 })
      .exec();

    const items = entries
      .filter((e) => e.itemId)
      .map((e) => ({
        wishlistId: e._id,
        addedAt: e.createdAt,
        ...transformItem(e.itemId),
      }));

    res.json(items);
  } catch (err) {
    next(err);
  }
};

module.exports = { addToWishlist, removeFromWishlist, getWishlist };
