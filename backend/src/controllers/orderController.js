const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const sendEmail = require('../utils/email');
const User = require ('../models/User');


const SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;
const TAX_RATE = 0.18;

// POST /api/orders
exports.createOrder = async (req, res) => {
  const { items, shippingAddress, payment, couponCode, customerNote, isGift, giftMessage, guestEmail, guestName } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in order.' });
  }

  // Validate each item and get current prices
  const orderItems = [];
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      return res.status(400).json({ success: false, message: `Product ${item.product} not available.` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      sku: item.sku,
    });
  }

  // Calculate pricing
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = Math.round(subtotal * TAX_RATE);
  let discount = 0;
  let couponData = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validity = coupon.isValid(req.user?._id, subtotal);
      if (validity.valid) {
        discount = coupon.calculateDiscount(subtotal);
        couponData = { code: coupon.code, discount };
        coupon.usedCount += 1;
        if (req.user) coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }
  }

  const total = Math.max(0, subtotal + shipping + tax - discount);

  const order = await Order.create({
    user: req.user?._id,
    guestEmail,
    guestName,
    items: orderItems,
    shippingAddress,
    pricing: { subtotal, shipping, tax, discount, total },
    coupon: couponData,
    payment: { method: payment.method, status: payment.method === 'cod' ? 'pending' : 'pending' },
    status: 'pending',
    customerNote,
    isGift,
    giftMessage,
  });

  // Decrement stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // Clear cart if logged in
  if (req.user) {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  }

  // Send order confirmation email
  try {
    const emailTo = req.user?.email || guestEmail;
    if (emailTo) {
      await sendEmail({
        to: emailTo,
        subject: `Order Confirmed — ${order.orderNumber}`,
        template: 'orderConfirmation',
        data: { order, name: req.user?.name || guestName },
      });
    }
  } catch (err) {
    console.error('Order email failed:', err.message);
  }

  res.status(201).json({ success: true, order });
};

// GET /api/orders — User's own orders
exports.getMyOrders = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select('orderNumber status items pricing payment createdAt tracking');

  res.status(200).json({ success: true, total, orders });
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    ...(req.user.role !== 'admin' ? { user: req.user._id } : {}),
  }).populate('items.product', 'name slug images');

  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  res.status(200).json({ success: true, order });
};

// PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  const cancellableStatuses = ['pending', 'confirmed', 'processing'];
  if (!cancellableStatuses.includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });
  }

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason, timestamp: new Date() });
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  res.status(200).json({ success: true, message: 'Order cancelled.', order });
};

// POST /api/orders/:id/return
exports.requestReturn = async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  if (order.status !== 'delivered') {
    return res.status(400).json({ success: false, message: 'Only delivered orders can be returned.' });
  }

  const deliveredAt = order.statusHistory.find(h => h.status === 'delivered')?.timestamp;
  const returnWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
  if (deliveredAt && Date.now() - deliveredAt.getTime() > returnWindow) {
    return res.status(400).json({ success: false, message: 'Return window (7 days) has expired.' });
  }

  order.returnRequest = {
    requested: true,
    reason,
    requestedAt: new Date(),
    status: 'pending',
  };
  order.status = 'return_requested';
  await order.save();

  res.status(200).json({ success: true, message: 'Return request submitted.', order });
};

// ─── ADMIN ──────────────────────────────────────────────────────────────────
// exports.getAdminDashboard = async (req, res) => {
//   res.status (200).json ({
//     success: true,
//     message: 'Admin dashboard data',
//   });
// };
exports.getAdminDashboard = async (req, res) => {
  try {
    const [
      totalOrders,

      totalCustomers,

      totalProducts,

      recentOrders,

      topProducts,
    ] = await Promise.all ([
      Order.countDocuments (),

      User.countDocuments ({role: 'customer'}),

      Product.countDocuments (),

      Order.find ().sort ({createdAt: -1}).limit (5).populate ('user', 'name'),

      Product.find ().sort ({soldCount: -1}).limit (5),
    ]);

    const revenueResult = await Order.aggregate ([
      {
        $match: {
          status: {$ne: 'cancelled'},
        },
      },

      {
        $group: {
          _id: null,

          totalRevenue: {
            $sum: '$pricing.total',
          },
        },
      },
    ]);

    const totalRevenue = revenueResult.length > 0
      ? revenueResult[0].totalRevenue
      : 0;

    const pendingOrders = await Order.countDocuments ({
      status: 'pending',
    });

    const ordersByStatusData = await Order.aggregate ([
      {
        $group: {
          _id: '$status',

          count: {$sum: 1},
        },
      },
    ]);

    const ordersByStatus = {};

    ordersByStatusData.forEach (item => {
      ordersByStatus[item._id] = item.count;
    });

    res.status (200).json ({
      success: true,

      stats: {
        totalRevenue,

        totalOrders,

        totalCustomers,

        totalProducts,

        pendingOrders,

        monthRevenue: totalRevenue,

        monthOrders: totalOrders,

        monthCustomers: totalCustomers,

        revenueGrowth: 0,
      },

      topProducts,

      recentOrders,

      revenueByDay: [],

      ordersByStatus,
    });
  } catch (error) {
    console.error (error);

    res.status (500).json ({
      success: false,

      message: error.message,
    });
  }
};


// GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.orderNumber = { $regex: search, $options: 'i' };

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, total, orders });
};

// PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  const { status, note, trackingNumber, carrier, estimatedDelivery } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  order.status = status;
  order.statusHistory.push({ status, note, updatedBy: req.user._id, timestamp: new Date() });

  if (trackingNumber) {
    order.tracking = {
      trackingNumber,
      carrier: carrier || '',
      estimatedDelivery: estimatedDelivery || null,
    };
  }

  if (status === 'delivered') {
    order.payment.status = order.payment.method === 'cod' ? 'paid' : order.payment.status;
  }

  await order.save();

  // Notify customer
  // if (order.user) {
  //   const user = await require('../models/User').findById(order.user).select('email name');
  //   if (user) {
  //     await sendEmail({
  //       to: user.email,
  //       subject: `Order Update — ${order.orderNumber}`,
  //       template: 'orderStatusUpdate',
  //       data: { name: user.name, order },
  //     }).catch(console.error);
  //   }
  // }
  console.log ('Order created:', order.orderNumber);


  res.status(200).json({ success: true, order });
};
