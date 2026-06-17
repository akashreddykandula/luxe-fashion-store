const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  cta: { label: String, link: String },
  image: {
    public_id: String,
    url: { type: String, required: true },
  },
  mobileImage: {
    public_id: String,
    url: String,
  },
  position: { type: String, enum: ['hero', 'category', 'promo', 'sidebar'], default: 'hero' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  validFrom: Date,
  validUntil: Date,
}, { timestamps: true });

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
  },
  isSubscribed: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: Date,
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = { Banner, Newsletter };
