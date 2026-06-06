// Purpose: Mongoose schema & model for orders
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'handover_pending', 'completed'],
    default: 'pending',
  },
  otp:         { type: String, required: true },   // bcrypt-hashed OTP
  plainOtp:    { type: String },                    // stored temporarily for buyer display; cleared on completion
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
