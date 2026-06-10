// Purpose: Create and configure the Express app, mount routes and middleware
const express = require('express');
const path = require('path');
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
const statsRoutes = require('./routes/statsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require('./routes/aiRoutes');

require('dotenv').config();

// Initialize DB connection immediately when app is required
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// Centralized error handler (should be last middleware)
app.use(errorHandler);

module.exports = app;
