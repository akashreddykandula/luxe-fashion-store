// ─── cart.js ─────────────────────────────────────────────────────────────────
const express = require('express');
const cartRouter = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCart, addToCart, updateCartItem, removeFromCart, saveForLater, applyCoupon, removeCoupon,
} = require('../controllers/cartController');

cartRouter.use(protect);
cartRouter.get('/', getCart);
cartRouter.post('/', addToCart);
cartRouter.put('/:itemId', updateCartItem);
cartRouter.delete('/:itemId', removeFromCart);
cartRouter.post('/:itemId/save-later', saveForLater);
cartRouter.post('/coupon', applyCoupon);
cartRouter.delete('/coupon/remove', removeCoupon);

// ─── wishlist.js ──────────────────────────────────────────────────────────────
const wishlistRouter = express.Router();
const { getWishlist, toggleWishlist } = require('../controllers/cartController');

wishlistRouter.use(protect);
wishlistRouter.get('/', getWishlist);
wishlistRouter.post('/:productId', toggleWishlist);

// ─── orders.js ───────────────────────────────────────────────────────────────
const orderRouter = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  createOrder, getMyOrders, getOrder, cancelOrder, requestReturn,
} = require('../controllers/orderController');

orderRouter.post('/', optionalAuth, createOrder);
orderRouter.get('/my', protect, getMyOrders);
orderRouter.get('/:id', protect, getOrder);
orderRouter.put('/:id/cancel', protect, cancelOrder);
orderRouter.post('/:id/return', protect, requestReturn);

// ─── payments.js ─────────────────────────────────────────────────────────────
const paymentRouter = express.Router();
const {
  createRazorpayOrder, verifyRazorpayPayment, initiateRefund, razorpayWebhook,
} = require('../controllers/paymentController');

paymentRouter.post('/razorpay/create-order', protect, createRazorpayOrder);
paymentRouter.post('/razorpay/verify', protect, verifyRazorpayPayment);
paymentRouter.post('/razorpay/refund', protect, initiateRefund);
paymentRouter.post('/razorpay/webhook', razorpayWebhook);

// ─── reviews.js ──────────────────────────────────────────────────────────────
const reviewRouter = express.Router();
const {
  getReviews, createReview, updateReview, deleteReview, voteHelpful,
} = require('../controllers/cartController');

reviewRouter.get('/', getReviews);
reviewRouter.post('/', protect, createReview);
reviewRouter.put('/:id', protect, updateReview);
reviewRouter.delete('/:id', protect, deleteReview);
reviewRouter.post('/:id/helpful', protect, voteHelpful);

// ─── coupons.js ──────────────────────────────────────────────────────────────
const couponRouter = express.Router();
const Coupon = require('../models/Coupon');
const { restrictTo } = require('../middleware/auth');

couponRouter.post('/validate', protect, async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
  const validity = coupon.isValid(req.user._id, subtotal || 0);
  if (!validity.valid) return res.status(400).json({ success: false, message: validity.message });
  const discount = coupon.calculateDiscount(subtotal || 0);
  res.status(200).json({ success: true, discount, coupon: { code: coupon.code, description: coupon.description } });
});

couponRouter.get('/', protect, restrictTo('admin'), async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.status(200).json({ success: true, coupons });
});
couponRouter.post('/', protect, restrictTo('admin'), async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});
couponRouter.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, coupon });
});
couponRouter.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Coupon deleted.' });
});

// ─── categories.js ───────────────────────────────────────────────────────────
const categoryRouter = express.Router();
const Category = require('../models/Category');

categoryRouter.get('/', async (req, res) => {
  const { gender, parent, featured } = req.query;
  const filter = { isActive: true };
  if (gender) filter.gender = { $in: [gender, 'all'] };
  if (parent === 'null') filter.parent = null;
  else if (parent) filter.parent = parent;
  if (featured === 'true') filter.isFeatured = true;
  const categories = await Category.find(filter).sort('order name').populate('children');
  res.status(200).json({ success: true, categories });
});
categoryRouter.get('/:slug', async (req, res) => {
  const cat = await Category.findOne({ slug: req.params.slug, isActive: true }).populate('children');
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
  res.status(200).json({ success: true, category: cat });
});
categoryRouter.post('/', protect, restrictTo('admin'), async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json({ success: true, category: cat });
});
categoryRouter.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, category: cat });
});
categoryRouter.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Category deleted.' });
});

// ─── users.js ─────────────────────────────────────────────────────────────────
const userRouter = express.Router();
const User = require('../models/User');
const { uploadAvatar } = require('../config/cloudinary');

userRouter.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

userRouter.put('/profile', protect, async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });
  res.status(200).json({ success: true, user });
});

userRouter.post('/avatar', protect, uploadAvatar.single('avatar'), async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: { public_id: req.file.filename, url: req.file.path } },
    { new: true }
  );
  res.status(200).json({ success: true, avatar: user.avatar });
});

userRouter.post('/address', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

userRouter.put('/address/:id', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) return res.status(404).json({ success: false, message: 'Address not found.' });
  if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false));
  Object.assign(addr, req.body);
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
});

userRouter.delete('/address/:id', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
});

// Admin: manage users
userRouter.get('/', protect, restrictTo('admin'), async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = { role: 'customer' };
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const total = await User.countDocuments(filter);
  const users = await User.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
  res.status(200).json({ success: true, total, users });
});

userRouter.put('/:id/status', protect, restrictTo('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
  res.status(200).json({ success: true, user });
});

// ─── upload.js ────────────────────────────────────────────────────────────────
const uploadRouter = express.Router();
const { uploadBanner } = require('../config/cloudinary');
const { Banner } = require('../models/Banner');

uploadRouter.get('/banners', async (req, res) => {
  const { position } = req.query;
  const filter = { isActive: true };
  if (position) filter.position = position;
  const banners = await Banner.find(filter).sort('order');
  res.status(200).json({ success: true, banners });
});

uploadRouter.post('/banners', protect, restrictTo('admin'), uploadBanner.fields([{ name: 'image', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), async (req, res) => {
  const data = { ...req.body };
  if (req.files?.image) data.image = { public_id: req.files.image[0].filename, url: req.files.image[0].path };
  if (req.files?.mobileImage) data.mobileImage = { public_id: req.files.mobileImage[0].filename, url: req.files.mobileImage[0].path };
  const banner = await Banner.create(data);
  res.status(201).json({ success: true, banner });
});

uploadRouter.put('/banners/:id', protect, restrictTo('admin'), async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, banner });
});

uploadRouter.delete('/banners/:id', protect, restrictTo('admin'), async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Banner deleted.' });
});

// ─── newsletter.js ───────────────────────────────────────────────────────────
const newsletterRouter = express.Router();
const { Newsletter } = require('../models/Banner');

newsletterRouter.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
  await Newsletter.findOneAndUpdate({ email: email.toLowerCase() }, { isSubscribed: true, subscribedAt: new Date() }, { upsert: true, new: true });
  res.status(200).json({ success: true, message: 'Subscribed successfully!' });
});

newsletterRouter.post('/unsubscribe', async (req, res) => {
  const { email } = req.body;
  await Newsletter.findOneAndUpdate({ email: email.toLowerCase() }, { isSubscribed: false, unsubscribedAt: new Date() });
  res.status(200).json({ success: true, message: 'Unsubscribed.' });
});

// ─── contact.js ───────────────────────────────────────────────────────────────
const contactRouter = express.Router();
const sendEmail = require('../utils/email');

contactRouter.post('/', async (req, res) => {
  const { name, email, subject, message, phone } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
  try {
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `Contact Form: ${subject || 'New inquiry'}`,
      template: 'contact',
      data: { name, email, phone, message, subject },
    });
    res.status(200).json({ success: true, message: 'Your message has been sent. We will get back to you soon.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

// ─── admin.js ────────────────────────────────────────────────────────────────
const adminRouter = express.Router();
const { getAdminDashboard, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

adminRouter.use(protect, restrictTo('admin'));
adminRouter.get('/dashboard', getAdminDashboard);
adminRouter.get('/orders', getAllOrders);
adminRouter.put('/orders/:id/status', updateOrderStatus);

module.exports = {
  cartRouter,
  wishlistRouter,
  orderRouter,
  paymentRouter,
  reviewRouter,
  couponRouter,
  categoryRouter,
  userRouter,
  uploadRouter,
  newsletterRouter,
  contactRouter,
  adminRouter,
};
