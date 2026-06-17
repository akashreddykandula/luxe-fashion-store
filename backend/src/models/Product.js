const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: { type: String, default: '#000000' },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true },
  additionalPrice: { type: Number, default: 0 },
});

const imageSchema = new mongoose.Schema({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
  alt: String,
  isDefault: { type: Boolean, default: false },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative'],
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required'],
  },
  subcategory: String,
  brand: {
    type: String,
    default: 'LUXE',
  },
  tags: [String],
  images: [imageSchema],
  variants: [variantSchema],
  sizes: [String],
  colors: [String],
  material: String,
  careInstructions: [String],
  specifications: [{
    key: String,
    value: String,
  }],
  gender: {
    type: String,
    enum: ['men', 'women', 'unisex', 'kids'],
    required: true,
  },
  ageGroup: {
    type: String,
    enum: ['adult', 'teen', 'kids', 'infant'],
    default: 'adult',
  },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isLimitedEdition: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  flashSalePrice: Number,
  flashSaleEnd: Date,
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  soldCount: { type: Number, default: 0 },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
  metaTitle: String,
  metaDescription: String,
  weight: Number, // grams
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ isTrending: 1 });

// Virtual: discount percentage
productSchema.virtual('discountPercent').get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Virtual: in-stock status
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

// Populate sizes and colors from variants
productSchema.pre('save', function (next) {
  if (this.variants && this.variants.length > 0) {
    this.sizes = [...new Set(this.variants.map(v => v.size))];
    this.colors = [...new Set(this.variants.map(v => v.color))];
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
