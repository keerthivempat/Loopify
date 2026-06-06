// Purpose: Mongoose schema & model for items listed in the marketplace
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stockQuantity: { type: Number, default: 0 },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Books', 'Clothing', 'Furniture', 'Stationery', 'Sports', 'Miscellaneous'],
  },
  imageUrl: String,
  images: [String],
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available',
  },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
