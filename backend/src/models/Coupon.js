const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: String,
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  maxDiscount: Number, // cap for percentage coupons
  minOrderAmount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: null }, // null = unlimited
  usagePerUser: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isFirstOrderOnly: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

couponSchema.methods.isValid = function (userId, orderAmount) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (now < this.validFrom) return { valid: false, message: 'Coupon is not yet active' };
  if (now > this.validUntil) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderAmount) return { valid: false, message: `Minimum order amount is ₹${this.minOrderAmount}` };
  if (userId && this.usedBy.includes(userId.toString())) {
    const userUsageCount = this.usedBy.filter(id => id.toString() === userId.toString()).length;
    if (userUsageCount >= this.usagePerUser) return { valid: false, message: 'You have already used this coupon' };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (subtotal) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (subtotal * this.discountValue) / 100;
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  } else {
    discount = Math.min(this.discountValue, subtotal);
  }
  return Math.round(discount);
};

module.exports = mongoose.model('Coupon', couponSchema);
