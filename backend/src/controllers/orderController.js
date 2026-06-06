// Purpose: Order placement and management controllers
const Order  = require('../models/Order');
const Item   = require('../models/Item');
const Cart   = require('../models/Cart');
const User   = require('../models/User');
const { generateOtp, verifyOtp } = require('../services/otpService');

// ─── POST /api/orders/place ─────────────────────────────────────────────────
const placeOrders = async (req, res, next) => {
  try {
    const { items } = req.body;
    const buyerId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: 'Invalid items data' });

    const orders = [];

    for (const item of items) {
      const { plainOtp, hashedOtp } = await generateOtp();

      // Support item payload from cart (item.itemId._id) or plain itemId string
      const itemIdRaw = item.itemId?._id ?? item.itemId;
      const dbItem = await Item.findById(itemIdRaw).populate('sellerId', 'firstName lastName email');
      if (!dbItem) continue;
      if (dbItem.status === 'sold') continue; // skip already-sold items

      const order = new Order({
        buyerId,
        sellerId: dbItem.sellerId._id,
        itemId:   dbItem._id,
        quantity: item.quantity,
        otp:      hashedOtp,
        plainOtp,               // stored for buyer view; cleared after handover
        status:   'pending',
      });

      await order.save();

      orders.push({
        _id:      order._id,
        buyerId:  order.buyerId,
        sellerId: dbItem.sellerId,
        itemId:   dbItem,
        quantity: order.quantity,
        status:   order.status,
        plainOtp,
        createdAt: order.createdAt,
      });
    }

    if (orders.length === 0)
      return res.status(400).json({ message: 'No valid items to order' });

    // Clear buyer cart
    await Cart.findOneAndDelete({ userId: buyerId });
    await User.findByIdAndUpdate(buyerId, { cartCount: 0 });

    res.json({ message: 'Orders placed successfully', orders });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/buyer ──────────────────────────────────────────────────
const getBuyerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id })
      .populate({ path: 'itemId',   select: 'name price description imageUrl status' })
      .populate({ path: 'sellerId', select: 'firstName lastName email' })
      .populate({ path: 'buyerId',  select: 'firstName lastName email' })
      .sort({ createdAt: -1 });

    // Return plainOtp only while order is pending / handover_pending
    const processed = orders.map(order => {
      const obj = order.toObject();
      if (!['pending', 'handover_pending'].includes(order.status)) {
        delete obj.plainOtp; // don't expose OTP after completion/rejection
      }
      return obj;
    });

    res.json(processed);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/seller ─────────────────────────────────────────────────
const getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ sellerId: req.user.id })
      .populate({ path: 'itemId',   select: 'name price description imageUrl status' })
      .populate({ path: 'sellerId', select: 'firstName lastName email' })
      .populate({ path: 'buyerId',  select: 'firstName lastName email' })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/orders/complete  (seller verifies OTP → completes handover) ──
const completeOrder = async (req, res, next) => {
  try {
    const { orderId, otp } = req.body;
    if (!orderId || !otp)
      return res.status(400).json({ message: 'Order ID and OTP are required' });

    const order = await Order.findById(orderId)
      .populate('itemId')
      .populate('sellerId')
      .populate('buyerId');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.sellerId._id.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized to complete this order' });
    if (order.status === 'completed')
      return res.status(400).json({ message: 'Order is already completed' });
    if (order.status === 'rejected')
      return res.status(400).json({ message: 'Cannot complete a rejected order' });

    const isValid = await verifyOtp(otp, order.otp);
    if (!isValid) return res.status(400).json({ message: 'Invalid OTP' });

    // Mark order complete & clear plainOtp
    order.status      = 'completed';
    order.completedAt = new Date();
    order.plainOtp    = undefined;
    await order.save();

    // Mark the item as sold
    await Item.findByIdAndUpdate(order.itemId._id, { status: 'sold' });

    res.json({ message: 'Order completed successfully', order });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/orders/regenerate-otp/:orderId  (buyer regenerates OTP) ──────
const regenerateOtp = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyerId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized to regenerate OTP for this order' });
    if (!['pending', 'handover_pending'].includes(order.status))
      return res.status(400).json({ message: 'Can only regenerate OTP for active orders' });

    const { plainOtp, hashedOtp } = await generateOtp();
    order.otp      = hashedOtp;
    order.plainOtp = plainOtp;
    await order.save();

    res.json({ message: 'OTP regenerated successfully', orderId: order._id, plainOtp });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/orders/:id/accept  (seller accepts order) ───────────────────
const acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, sellerId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending')
      return res.status(400).json({ message: `Order is already ${order.status}` });

    order.status = 'handover_pending';
    await order.save();
    res.json({ message: 'Order accepted — awaiting OTP handover', order });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/orders/:id/reject  (seller rejects order) ───────────────────
const rejectOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, sellerId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending')
      return res.status(400).json({ message: `Order is already ${order.status}` });

    order.status   = 'rejected';
    order.plainOtp = undefined; // revoke OTP on rejection
    await order.save();
    res.json({ message: 'Order rejected', order });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  placeOrders,
  getBuyerOrders,
  getSellerOrders,
  completeOrder,
  regenerateOtp,
  acceptOrder,
  rejectOrder,
};
