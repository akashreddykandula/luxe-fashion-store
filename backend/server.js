require ('dotenv').config ();
require ('express-async-errors');
const express = require ('express');
const cors = require ('cors');
const helmet = require ('helmet');
const mongoSanitize = require ('express-mongo-sanitize');
const xssClean = require ('xss-clean');
const hpp = require ('hpp');
const morgan = require ('morgan');
const rateLimit = require ('express-rate-limit');
const connectDB = require ('./src/config/database');
const errorHandler = require ('./src/middleware/errorHandler');

// Route imports
const authRoutes = require ('./src/routes/auth');
const userRoutes = require ('./src/routes/users');
const productRoutes = require ('./src/routes/products');
const categoryRoutes = require ('./src/routes/categories');
const cartRoutes = require ('./src/routes/cart');
const wishlistRoutes = require ('./src/routes/wishlist');
const orderRoutes = require ('./src/routes/orders');
const paymentRoutes = require ('./src/routes/payments');
const couponRoutes = require ('./src/routes/coupons');
const reviewRoutes = require ('./src/routes/reviews');
const uploadRoutes = require ('./src/routes/upload');
const adminRoutes = require ('./src/routes/admin');
const newsletterRoutes = require ('./src/routes/newsletter');
const contactRoutes = require ('./src/routes/contact');

const app = express ();
app.set ('trust proxy', 1);

// Connect to database
connectDB ();

// Security middleware
app.use (helmet ());
app.use (mongoSanitize ());
app.use (xssClean ());
app.use (hpp ());

// Rate limiting
const limiter = rateLimit ({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use ('/api', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit ({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again later.',
  },
});
app.use ('/api/auth', authLimiter);

// Body parsing
app.use (express.json ({limit: '10mb'}));
app.use (express.urlencoded ({extended: true, limit: '10mb'}));

// CORS
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials:true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use (
//   cors ({
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })
// );
app.use (
  cors ({
    origin: [
      'http://localhost:5173',
      'https://luxe-fashion-store-six.vercel.app',
      'https://luxe-fashion-store-hp0yxlzkt-akash-kandulas-projects.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use (morgan ('dev'));
}

// Health check
app.get ('/health', (req, res) => {
  res.status (200).json ({status: 'OK', timestamp: new Date ().toISOString ()});
});

// API Routes
app.use ('/api/auth', authRoutes);
app.use ('/api/users', userRoutes);
app.use ('/api/products', productRoutes);
app.use ('/api/categories', categoryRoutes);
app.use ('/api/cart', cartRoutes);
app.use ('/api/wishlist', wishlistRoutes);
app.use ('/api/orders', orderRoutes);
app.use ('/api/payments', paymentRoutes);
app.use ('/api/coupons', couponRoutes);
app.use ('/api/reviews', reviewRoutes);
app.use ('/api/upload', uploadRoutes);
app.use ('/api/admin', adminRoutes);
app.use ('/api/newsletter', newsletterRoutes);
app.use ('/api/contact', contactRoutes);

app.get ('/api/test', (req, res) => {
  res.json ({
    success: true,
    authRoutesLoaded: true,
  });
});

try {
  const authRoutes = require ('./src/routes/auth');
  app.use ('/api/auth', authRoutes);
  console.log ('✅ Auth routes loaded');
} catch (err) {
  console.error ('❌ Auth routes failed:', err);
}

// 404 handler
app.use ((req, res) => {
  res
    .status (404)
    .json ({success: false, message: `Route ${req.originalUrl} not found`});
});

// Global error handler
app.use (errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen (PORT, () => {
  console.log (
    `🚀 LUXE Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});

// Graceful shutdown
process.on ('unhandledRejection', err => {
  console.error ('UNHANDLED REJECTION:', err.message);
  server.close (() => process.exit (1));
});

process.on ('SIGTERM', () => {
  console.log ('SIGTERM received. Shutting down gracefully...');
  server.close (() => process.exit (0));
});

module.exports = app;
