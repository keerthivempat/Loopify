// Purpose: Mongoose schema for buyer-to-seller item inquiries
const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  buyerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },

  // Buyer details (denormalized at creation time)
  buyerName:  { type: String, required: true },
  buyerEmail: { type: String, required: true },

  // Buyer's inquiry message
  inquiryMessage: { type: String, required: true },

  // Seller's response (populated when seller accepts)
  sellerReply: { type: String, default: '' },
  sellerPhone: { type: String, default: '' },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Inquiry', inquirySchema);
