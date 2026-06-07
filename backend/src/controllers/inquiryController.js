// Purpose: Inquiry controllers — create, list (buyer & seller), accept/reject
const Inquiry  = require('../models/Inquiry');
const Item     = require('../models/Item');
const mongoose = require('mongoose');

// ─── POST /api/inquiries ─────────────────────────────────────────────────────
const createInquiry = async (req, res, next) => {
  try {
    const { itemId, name, email, message } = req.body;
    const buyerId = req.user.id;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId))
      return res.status(400).json({ message: 'Valid item ID is required' });
    if (!name?.trim())    return res.status(400).json({ message: 'Name is required' });
    if (!email?.trim())   return res.status(400).json({ message: 'Email is required' });
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const sellerId = item.sellerId?.toString();
    if (!sellerId)
      return res.status(400).json({ message: 'Item has no seller information' });
    if (sellerId === buyerId.toString())
      return res.status(400).json({ message: 'You cannot send an inquiry for your own listing' });

    const inquiry = new Inquiry({
      buyerId,
      sellerId,
      itemId,
      buyerName:      name.trim(),
      buyerEmail:     email.trim(),
      inquiryMessage: message.trim(),
      status:         'pending',
    });

    await inquiry.save();
    res.status(201).json({ message: 'Inquiry sent successfully', inquiry });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/inquiries/seller ───────────────────────────────────────────────
const getSellerInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ sellerId: req.user.id })
      .populate('itemId',  'name price imageUrl category status')
      .populate('buyerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/inquiries/buyer ────────────────────────────────────────────────
const getBuyerInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ buyerId: req.user.id })
      .populate('itemId',   'name price imageUrl category status')
      .populate('sellerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/inquiries/:id/accept ────────────────────────────────────────
// Body: { sellerPhone, sellerReply }
const acceptInquiry = async (req, res, next) => {
  try {
    const { sellerPhone, sellerReply } = req.body;

    if (!sellerPhone?.trim())
      return res.status(400).json({ message: 'Contact number is required' });

    const inquiry = await Inquiry.findOne({ _id: req.params.id, sellerId: req.user.id });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    if (inquiry.status !== 'pending')
      return res.status(400).json({ message: `Inquiry is already ${inquiry.status}` });

    inquiry.status      = 'accepted';
    inquiry.sellerPhone = sellerPhone.trim();
    inquiry.sellerReply = sellerReply?.trim() || '';
    await inquiry.save();

    res.json({ message: 'Inquiry accepted', inquiry });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/inquiries/:id/reject ────────────────────────────────────────
const rejectInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findOne({ _id: req.params.id, sellerId: req.user.id });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    if (inquiry.status !== 'pending')
      return res.status(400).json({ message: `Inquiry is already ${inquiry.status}` });

    inquiry.status = 'rejected';
    await inquiry.save();

    res.json({ message: 'Inquiry rejected', inquiry });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInquiry,
  getSellerInquiries,
  getBuyerInquiries,
  acceptInquiry,
  rejectInquiry,
};
