require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const prisma = require('./db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const fileRoutes = require('./routes/files');
const ecommerceRoutes = require('./routes/ecommerce');
const emailRoutes = require('./routes/email');
const chatRoutes = require('./routes/chat');
const socialRoutes = require('./routes/social');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logger

// Routes
app.get('/', (req, res) => {
  res.send('Riho API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/products', ecommerceRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
