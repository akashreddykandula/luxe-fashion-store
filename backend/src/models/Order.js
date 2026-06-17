const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: String,
  color: String,
  sku: String,
});

const statusHistorySchema = new mongoose.Schema({
  status: String,
  note: String,
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Guest checkout support
  guestEmail: String,
  guestName: String,

  items: [orderItemSchema],

  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },

  pricing: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },

  coupon: {
    code: String,
    discount: Number,
  },

  payment: {
    method: {
      type: String,
      enum: ['razorpay', 'cod', 'upi', 'card', 'netbanking'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partial_refund'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt: Date,
    refundId: String,
    refundedAt: Date,
    refundAmount: Number,
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'],
    default: 'pending',
  },

  statusHistory: [statusHistorySchema],

  tracking: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,
  },

  returnRequest: {
    requested: { type: Boolean, default: false },
    reason: String,
    requestedAt: Date,
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'] },
    processedAt: Date,
  },

  notes: String, // Admin notes
  customerNote: String,

  invoiceUrl: String,
  isGift: { type: Boolean, default: false },
  giftMessage: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    const pad = String(count + 1).padStart(6, '0');
    this.orderNumber = `LUXE-${pad}-${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

// Add status history entry on status change
orderSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });

module.exports = mongoose.model('Order', orderSchema);
