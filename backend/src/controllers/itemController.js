// Purpose: Item-related handlers (list, detail, create, update, delete)
const Item = require('../models/Item');
const mongoose = require('mongoose');

const getOwnerId = (item) => item.createdBy?.toString() || item.sellerId?.toString();

const isOwner = (item, userId) => getOwnerId(item) === userId.toString();

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
  createdBy: item.createdBy?._id || item.createdBy,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  vendorName: item.sellerId?.firstName
    ? `${item.sellerId.firstName} ${item.sellerId.lastName}`
    : 'Unknown Vendor',
});

const listItems = async (req, res, next) => {
  try {
    const { search, categories } = req.query;
    const query = { $or: [{ status: 'available' }, { status: { $exists: false } }] };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (categories) {
      const categoryArray = categories.split(',');
      query.category = { $in: categoryArray };
    }

    const items = await Item.find(query)
      .populate('sellerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();

    res.json(items.map(transformItem));
  } catch (err) {
    next(err);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id.toString());
    const items = await Item.find({
      $or: [{ createdBy: userId }, { sellerId: userId }],
    })
      .populate('sellerId', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .exec();

    res.json(items.map(transformItem));
  } catch (err) {
    next(err);
  }
};

const getItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid item ID' });

    const item = await Item.findById(id).populate('sellerId', 'firstName lastName email').exec();
    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.json({
      ...transformItem(item),
      vendorEmail: item.sellerId ? item.sellerId.email : 'unknown@email.com',
    });
  } catch (err) {
    next(err);
  }
};

const createItem = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl, images, stockQuantity } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!description?.trim()) return res.status(400).json({ message: 'Description is required' });
    if (price === undefined || price === null || Number(price) < 0) {
      return res.status(400).json({ message: 'A valid price is required' });
    }
    if (!category) return res.status(400).json({ message: 'Category is required' });

    const userId = new mongoose.Types.ObjectId(req.user.id.toString());
    const imageList = images?.length ? images.filter(Boolean) : imageUrl ? [imageUrl] : [];

    const newItem = new Item({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      stockQuantity: stockQuantity ?? 1,
      sellerId: userId,
      createdBy: userId,
      imageUrl: imageList[0] || undefined,
      images: imageList,
      status: 'available',
    });

    await newItem.save();
    const populated = await Item.findById(newItem._id).populate('sellerId', 'firstName lastName');
    res.status(201).json(transformItem(populated));
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid item ID' });

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!isOwner(item, req.user.id)) return res.status(403).json({ message: 'Unauthorized to modify this listing' });

    const { name, description, price, category, imageUrl, images, stockQuantity, status } = req.body;

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (category !== undefined) item.category = category;
    if (stockQuantity !== undefined) item.stockQuantity = stockQuantity;
    if (status !== undefined) item.status = status;

    if (images !== undefined) {
      item.images = images;
      item.imageUrl = images[0] || item.imageUrl;
    } else if (imageUrl !== undefined) {
      item.imageUrl = imageUrl;
      item.images = imageUrl ? [imageUrl] : [];
    }

    await item.save();
    const populated = await Item.findById(item._id).populate('sellerId', 'firstName lastName');
    res.json(transformItem(populated));
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid item ID' });

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!isOwner(item, req.user.id)) return res.status(403).json({ message: 'Unauthorized to delete this listing' });

    await Item.findByIdAndDelete(id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const markAsSold = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid item ID' });

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!isOwner(item, req.user.id)) return res.status(403).json({ message: 'Unauthorized to modify this listing' });

    item.status = 'sold';
    item.stockQuantity = 0;
    await item.save();

    const populated = await Item.findById(item._id).populate('sellerId', 'firstName lastName');
    res.json(transformItem(populated));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listItems,
  getMyListings,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  markAsSold,
};
