// Purpose: Cart management controllers
const Cart = require('../models/Cart');
const User = require('../models/User');

const addToCart = async (req, res, next) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const existingIndex = cart.items.findIndex((it) => it.itemId.toString() === itemId);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ itemId, quantity });
      user.cartCount += 1;
      await user.save();
    }

    await cart.save();
    res.json({ cart, cartCount: user.cartCount });
  } catch (err) {
    next(err);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    cart.items = cart.items.filter((i) => i.itemId.toString() !== itemId);
    await cart.save();

    user.cartCount = Math.max(0, user.cartCount - 1);
    await user.save();

    res.json({ cart, cartCount: user.cartCount });
  } catch (err) {
    next(err);
  }
};

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate('items.itemId');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!cart) return res.json({ items: [], cartCount: user.cartCount });
    res.json({ cart, cartCount: user.cartCount });
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Cart.findOneAndDelete({ userId });
    user.cartCount = 0;
    await user.save();

    res.json({ message: 'Cart cleared successfully', cartCount: 0 });
  } catch (err) {
    next(err);
  }
};

module.exports = { addToCart, removeFromCart, getCart, clearCart };
