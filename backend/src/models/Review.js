const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    maxlength: [100, 'Review title cannot exceed 100 characters'],
  },
  body: {
    type: String,
    required: [true, 'Review body is required'],
    maxlength: [2000, 'Review cannot exceed 2000 characters'],
  },
  images: [{
    public_id: String,
    url: String,
  }],
  size: String,
  color: String,
  fit: { type: String, enum: ['runs_small', 'true_to_size', 'runs_large'] },
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  helpfulVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isApproved: { type: Boolean, default: true },
  adminReply: String,
}, {
  timestamps: true,
});

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ rating: -1 });

// Static method to update product rating after review changes
reviewSchema.statics.updateProductRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const Product = require('./Product');
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(result[0].average * 10) / 10,
      'ratings.count': result[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.updateProductRating(this.product);
});

reviewSchema.post('remove', function () {
  this.constructor.updateProductRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
