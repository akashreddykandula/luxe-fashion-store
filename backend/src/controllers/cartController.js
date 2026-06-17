// ─── CART CONTROLLER ─────────────────────────────────────────────────────────
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const User = require('../models/User');
const Order = require('../models/Order');

// GET /api/cart
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name slug price comparePrice images stock isActive',
  });

  if (!cart) {
    const newCart = await Cart.create({ user: req.user._id, items: [] });
    return res.status(200).json({ success: true, cart: newCart });
  }

  // Filter out unavailable products
  cart.items = cart.items.filter(item => item.product && item.product.isActive);
  await cart.save();

  res.status(200).json({ success: true, cart });
};

// POST /api/cart
exports.addToCart = async (req, res) => {
  const { productId, quantity = 1, size, color, sku } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  if (product.stock < quantity) {
    return res.status(400).json({ success: false, message: 'Insufficient stock.' });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existingIdx = cart.items.findIndex(
    i => i.product.toString() === productId && i.size === size && i.color === color && !i.savedForLater
  );

  if (existingIdx >= 0) {
    cart.items[existingIdx].quantity = Math.min(cart.items[existingIdx].quantity + quantity, 10);
  } else {
    cart.items.push({ product: productId, quantity, size, color, sku, price: product.price });
  }

  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name slug price comparePrice images stock' });
  res.status(200).json({ success: true, cart });
};

// PUT /api/cart/:itemId
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart.' });

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    item.quantity = Math.min(quantity, 10);
  }

  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name slug price comparePrice images stock' });
  res.status(200).json({ success: true, cart });
};

// DELETE /api/cart/:itemId
exports.removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

  cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.status(200).json({ success: true, message: 'Item removed.', cart });
};

// POST /api/cart/:itemId/save-for-later
exports.saveForLater = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart?.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

  item.savedForLater = !item.savedForLater;
  await cart.save();
  res.status(200).json({ success: true, cart });
};

// POST /api/cart/coupon
exports.applyCoupon = async (req, res) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });

  const subtotal = cart.items.filter(i => !i.savedForLater).reduce((s, i) => s + i.price * i.quantity, 0);
  const validity = coupon.isValid(req.user._id, subtotal);
  if (!validity.valid) return res.status(400).json({ success: false, message: validity.message });

  const discount = coupon.calculateDiscount(subtotal);
  cart.coupon = { code: coupon.code, discount, discountType: coupon.discountType };
  await cart.save();

  res.status(200).json({ success: true, discount, message: `Coupon applied! You save ₹${discount}` });
};

// DELETE /api/cart/coupon
exports.removeCoupon = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });
  cart.coupon = undefined;
  await cart.save();
  res.status(200).json({ success: true, message: 'Coupon removed.' });
};

// ─── WISHLIST ─────────────────────────────────────────────────────────────────

// GET /api/wishlist
exports.getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'name slug price comparePrice images ratings stock isActive',
  });
  const wishlist = (user.wishlist || []).filter(p => p.isActive);
  res.status(200).json({ success: true, wishlist });
};

// POST /api/wishlist/:productId
exports.toggleWishlist = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(productId);

  if (idx === -1) {
    user.wishlist.push(productId);
    await user.save();
    return res.status(200).json({ success: true, added: true, message: 'Added to wishlist.' });
  } else {
    user.wishlist.splice(idx, 1);
    await user.save();
    return res.status(200).json({ success: true, added: false, message: 'Removed from wishlist.' });
  }
};

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

// GET /api/reviews?product=id
exports.getReviews = async (req, res) => {
  const { product, page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const filter = { isApproved: true };
  if (product) filter.product = product;

  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, total, reviews });
};

// POST /api/reviews
exports.createReview = async (req, res) => {
  const { product, rating, title, body, size, color, fit } = req.body;

  // Check if already reviewed
  const existing = await Review.findOne({ product, user: req.user._id });
  if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });

  // Check verified purchase
  const order = await Order.findOne({ user: req.user._id, 'items.product': product, status: 'delivered' });

  const review = await Review.create({
    product,
    user: req.user._id,
    rating,
    title,
    body,
    size,
    color,
    fit,
    isVerifiedPurchase: !!order,
  });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, review });
};

// PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  Object.assign(review, req.body);
  await review.save();
  res.status(200).json({ success: true, review });
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') filter.user = req.user._id;

  const review = await Review.findOne(filter);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  await review.deleteOne();
  res.status(200).json({ success: true, message: 'Review deleted.' });
};

// POST /api/reviews/:id/helpful
exports.voteHelpful = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  const hasVoted = review.helpfulVoters.includes(req.user._id);
  if (hasVoted) {
    review.helpfulVoters.pull(req.user._id);
    review.helpfulVotes -= 1;
  } else {
    review.helpfulVoters.push(req.user._id);
    review.helpfulVotes += 1;
  }
  await review.save();
  res.status(200).json({ success: true, helpfulVotes: review.helpfulVotes });
};

// ─── ADMIN ANALYTICS ─────────────────────────────────────────────────────────

exports.getAdminDashboard = async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    totalOrders,
    monthOrders,
    totalCustomers,
    monthCustomers,
    pendingOrders,
    topProducts,
    recentOrders,
    ordersByStatus,
    revenueByDay,
  ] = await Promise.all([
    Order.aggregate([{ $match: { 'payment.status': 'paid' } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
    Order.aggregate([{ $match: { 'payment.status': 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
    Order.aggregate([{ $match: { 'payment.status': 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ status: 'pending' }),
    Product.find().sort('-soldCount').limit(5).select('name slug images price soldCount ratings'),
    Order.find().sort('-createdAt').limit(10).populate('user', 'name email').select('orderNumber status pricing createdAt user'),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { 'payment.status': 'paid', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const monthRevenueVal = monthRevenue[0]?.total || 0;
  const lastMonthRevenueVal = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth = lastMonthRevenueVal
    ? (((monthRevenueVal - lastMonthRevenueVal) / lastMonthRevenueVal) * 100).toFixed(1)
    : 100;

  res.status(200).json({
    success: true,
    stats: {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthRevenue: monthRevenueVal,
      revenueGrowth: Number(revenueGrowth),
      totalOrders,
      monthOrders,
      totalCustomers,
      monthCustomers,
      pendingOrders,
    },
    topProducts,
    recentOrders,
    ordersByStatus: Object.fromEntries(ordersByStatus.map(o => [o._id, o.count])),
    revenueByDay,
  });
};
