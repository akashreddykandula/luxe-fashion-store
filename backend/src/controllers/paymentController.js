const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

console.log ('Razorpay Key:', process.env.RAZORPAY_KEY_ID);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/razorpay/create-order
exports.createRazorpayOrder = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  if (order.user && order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Unauthorized.' });
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.pricing.total * 100), // paise
    currency: 'INR',
    receipt: order.orderNumber,
    notes: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
    },
  });

  order.payment.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.status(200).json({
    success: true,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
};

// POST /api/payments/razorpay/verify
exports.verifyRazorpayPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
  }

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  order.payment.status = 'paid';
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.razorpaySignature = razorpaySignature;
  order.payment.paidAt = new Date();
  order.status = 'confirmed';
  order.statusHistory.push({ status: 'confirmed', note: 'Payment received', timestamp: new Date() });
  await order.save();

  res.status(200).json({ success: true, message: 'Payment verified successfully.', order });
};

// POST /api/payments/razorpay/refund
exports.initiateRefund = async (req, res) => {
  const { orderId, amount, reason } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  if (!order.payment.razorpayPaymentId) {
    return res.status(400).json({ success: false, message: 'No payment found for this order.' });
  }

  const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.pricing.total * 100);

  const refund = await razorpay.payments.refund(order.payment.razorpayPaymentId, {
    amount: refundAmount,
    notes: { reason: reason || 'Customer request' },
  });

  order.payment.status = 'refunded';
  order.payment.refundId = refund.id;
  order.payment.refundedAt = new Date();
  order.payment.refundAmount = refundAmount / 100;
  order.status = 'refunded';
  await order.save();

  res.status(200).json({ success: true, message: 'Refund initiated successfully.', refundId: refund.id });
};

// POST /api/payments/razorpay/webhook
exports.razorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (webhookSecret) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }
  }

  const { event, payload } = req.body;

  switch (event) {
    case 'payment.captured': {
      const paymentId = payload.payment.entity.id;
      const orderId = payload.payment.entity.notes?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          'payment.status': 'paid',
          'payment.razorpayPaymentId': paymentId,
          'payment.paidAt': new Date(),
          status: 'confirmed',
        });
      }
      break;
    }
    case 'payment.failed': {
      const orderId = payload.payment.entity.notes?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { 'payment.status': 'failed' });
      }
      break;
    }
    case 'refund.created': {
      const refundId = payload.refund.entity.id;
      const paymentId = payload.refund.entity.payment_id;
      await Order.findOneAndUpdate(
        { 'payment.razorpayPaymentId': paymentId },
        { 'payment.status': 'refunded', 'payment.refundId': refundId, 'payment.refundedAt': new Date() }
      );
      break;
    }
  }

  res.status(200).json({ received: true });
};
