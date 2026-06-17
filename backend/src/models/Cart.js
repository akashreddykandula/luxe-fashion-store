const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, max: 10 },
  size: String,
  color: String,
  sku: String,
  price: Number, // snapshot at time of adding
  savedForLater: { type: Boolean, default: false },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: Number,
    discountType: { type: String, enum: ['percentage', 'fixed'] },
  },
}, { timestamps: true });

cartSchema.virtual('subtotal').get(function () {
  return this.items
    .filter(i => !i.savedForLater)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
});

cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);
