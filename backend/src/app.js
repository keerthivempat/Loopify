// Purpose: Create and configure the Express app, mount routes and middleware
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const itemRoutes = require('./routes/itemRoutes');
const myListingsRoutes = require('./routes/myListingsRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

require('dotenv').config();

// Initialize DB connection immediately when app is required
connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// API route mounting
app.use('/api', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/my-listings', myListingsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Centralized error handler (should be last middleware)
app.use(errorHandler);

module.exports = app;
