require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const { Banner } = require('../models/Banner');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/luxe-store');
  console.log('MongoDB connected for seeding');
};

const categories = [
  { name: "Men's Clothing", slug: 'mens-clothing', gender: 'men', level: 0, isFeatured: true, order: 1 },
  { name: "Women's Clothing", slug: 'womens-clothing', gender: 'women', level: 0, isFeatured: true, order: 2 },
  { name: 'Kids', slug: 'kids', gender: 'kids', level: 0, isFeatured: false, order: 3 },
  { name: 'Accessories', slug: 'accessories', gender: 'unisex', level: 0, isFeatured: true, order: 4 },
  { name: "Men's T-Shirts", slug: 'mens-tshirts', gender: 'men', level: 1, order: 1 },
  { name: "Men's Jeans", slug: 'mens-jeans', gender: 'men', level: 1, order: 2 },
  { name: "Men's Shirts", slug: 'mens-shirts', gender: 'men', level: 1, order: 3 },
  { name: "Women's Dresses", slug: 'womens-dresses', gender: 'women', level: 1, order: 1 },
  { name: "Women's Tops", slug: 'womens-tops', gender: 'women', level: 1, order: 2 },
  { name: "Women's Jeans", slug: 'womens-jeans', gender: 'women', level: 1, order: 3 },
];

const sampleProducts = [
  {
    name: 'Classic White Oxford Shirt',
    shortDescription: 'Timeless Oxford shirt crafted from 100% Egyptian cotton',
    description: 'Our signature Oxford shirt is a wardrobe essential. Made from premium 100% Egyptian cotton with a subtle texture, this shirt offers comfort and elegance for any occasion. Features a classic button-down collar, chest pocket, and a tailored fit.',
    price: 2499,
    comparePrice: 3499,
    gender: 'men',
    brand: 'LUXE',
    tags: ['shirt', 'formal', 'cotton', 'classic', 'oxford'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Light Blue', 'Powder Pink'],
    material: '100% Egyptian Cotton',
    careInstructions: ['Machine wash cold', 'Do not bleach', 'Iron on medium heat'],
    isFeatured: true,
    isNewArrival: true,
    stock: 150,
    images: [
      { public_id: 'sample_1', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', isDefault: true },
      { public_id: 'sample_1b', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800' },
    ],
    variants: [
      { size: 'S', color: 'White', colorHex: '#FFFFFF', stock: 30, sku: 'OXF-WHT-S' },
      { size: 'M', color: 'White', colorHex: '#FFFFFF', stock: 40, sku: 'OXF-WHT-M' },
      { size: 'L', color: 'White', colorHex: '#FFFFFF', stock: 35, sku: 'OXF-WHT-L' },
    ],
    specifications: [
      { key: 'Fit', value: 'Regular Fit' },
      { key: 'Collar', value: 'Button-Down' },
      { key: 'Sleeve', value: 'Full Sleeve' },
    ],
    ratings: { average: 4.7, count: 128 },
  },
  {
    name: 'Slim Fit Stretch Jeans',
    shortDescription: 'Contemporary slim jeans with 4-way stretch for all-day comfort',
    description: 'These premium slim fit jeans combine style with functionality. The 4-way stretch fabric moves with you while the contemporary cut keeps you looking sharp. Features a classic 5-pocket design with a mid-rise waist.',
    price: 3299,
    comparePrice: 4999,
    gender: 'men',
    brand: 'LUXE',
    tags: ['jeans', 'slim fit', 'stretch', 'denim', 'casual'],
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Indigo Blue', 'Black', 'Grey Washed'],
    material: '98% Cotton, 2% Elastane',
    careInstructions: ['Machine wash cold', 'Wash dark colors separately', 'Do not tumble dry'],
    isFeatured: true,
    isBestSeller: true,
    stock: 200,
    images: [
      { public_id: 'sample_2', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', isDefault: true },
    ],
    variants: [
      { size: '30', color: 'Indigo Blue', colorHex: '#2B4F81', stock: 50, sku: 'JNS-IND-30' },
      { size: '32', color: 'Indigo Blue', colorHex: '#2B4F81', stock: 60, sku: 'JNS-IND-32' },
      { size: '32', color: 'Black', colorHex: '#000000', stock: 40, sku: 'JNS-BLK-32' },
    ],
    ratings: { average: 4.5, count: 94 },
  },
  {
    name: 'Floral Wrap Midi Dress',
    shortDescription: 'Elegant floral print wrap dress with a flattering silhouette',
    description: 'This stunning midi dress features a vibrant floral print on a flowing fabric that drapes beautifully. The wrap style creates a universally flattering silhouette with an adjustable tie waist. Perfect for everything from brunch to evening events.',
    price: 4499,
    comparePrice: 6999,
    gender: 'women',
    brand: 'LUXE',
    tags: ['dress', 'floral', 'midi', 'wrap', 'elegant', 'summer'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Floral Multicolor', 'Navy Print'],
    material: '100% Viscose',
    careInstructions: ['Hand wash recommended', 'Dry flat', 'Iron on low heat'],
    isFeatured: true,
    isNewArrival: true,
    isTrending: true,
    stock: 80,
    images: [
      { public_id: 'sample_3', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', isDefault: true },
      { public_id: 'sample_3b', url: 'https://images.unsplash.com/photo-1585482922553-e0dd3a64f65e?w=800' },
    ],
    variants: [
      { size: 'XS', color: 'Floral Multicolor', colorHex: '#E8A87C', stock: 15, sku: 'DRS-FLR-XS' },
      { size: 'S', color: 'Floral Multicolor', colorHex: '#E8A87C', stock: 25, sku: 'DRS-FLR-S' },
      { size: 'M', color: 'Floral Multicolor', colorHex: '#E8A87C', stock: 25, sku: 'DRS-FLR-M' },
    ],
    ratings: { average: 4.8, count: 203 },
  },
  {
    name: 'Premium Cashmere Blend Sweater',
    shortDescription: 'Luxuriously soft cashmere blend pullover in timeless silhouette',
    description: 'Crafted from a sumptuous cashmere and merino wool blend, this sweater offers exceptional warmth without bulk. The classic crew neck silhouette works seamlessly from casual weekends to smart-casual office days.',
    price: 5999,
    comparePrice: 8999,
    gender: 'unisex',
    brand: 'LUXE',
    tags: ['sweater', 'cashmere', 'luxury', 'winter', 'knitwear'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Camel', 'Ivory', 'Charcoal', 'Navy'],
    material: '70% Cashmere, 30% Merino Wool',
    careInstructions: ['Dry clean only', 'Store folded', 'Keep away from moths'],
    isFeatured: true,
    isLimitedEdition: true,
    stock: 45,
    images: [
      { public_id: 'sample_4', url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800', isDefault: true },
    ],
    ratings: { average: 4.9, count: 67 },
  },
  {
    name: 'High Waist Wide Leg Trousers',
    shortDescription: 'Statement wide-leg trousers with a modern high-rise waist',
    description: 'These elegant wide-leg trousers are cut from a fluid, structured fabric that falls beautifully. The high waist creates a long, elongating silhouette while the wide leg adds a touch of drama. A true wardrobe investment piece.',
    price: 3799,
    comparePrice: 5499,
    gender: 'women',
    brand: 'LUXE',
    tags: ['trousers', 'wide leg', 'high waist', 'formal', 'elegant'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Ivory', 'Caramel'],
    material: '65% Polyester, 30% Viscose, 5% Elastane',
    isFeatured: true,
    isBestSeller: true,
    stock: 120,
    images: [
      { public_id: 'sample_5', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b5cfa?w=800', isDefault: true },
    ],
    ratings: { average: 4.6, count: 156 },
  },
  {
    name: 'Relaxed Linen Shirt',
    shortDescription: 'Breathable linen shirt with a relaxed, modern cut',
    description: 'Made from 100% European linen, this relaxed fit shirt is your go-to for warm-weather style. The breathable fabric keeps you cool while the thoughtful details — curved hem, subtle chest pocket, and mother-of-pearl buttons — elevate it above the ordinary.',
    price: 2999,
    comparePrice: 3999,
    gender: 'men',
    brand: 'LUXE',
    tags: ['shirt', 'linen', 'summer', 'relaxed', 'casual'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Sand', 'White', 'Sage Green', 'Sky Blue'],
    material: '100% European Linen',
    isNewArrival: true,
    isTrending: true,
    stock: 90,
    images: [
      { public_id: 'sample_6', url: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800', isDefault: true },
    ],
    ratings: { average: 4.4, count: 82 },
  },
];

const coupons = [
  {
    code: 'WELCOME10',
    description: '10% off on your first order',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 500,
    minOrderAmount: 999,
    usagePerUser: 1,
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'LUXE20',
    description: '20% off on orders above ₹3999',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 1000,
    minOrderAmount: 3999,
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'FLAT500',
    description: '₹500 off on orders above ₹2499',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 2499,
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
];

const seed = async () => {
  await connectDB();

  console.log('🧹 Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Coupon.deleteMany({}),
    Banner.deleteMany({}),
  ]);

  // Create admin user
  console.log('👤 Creating admin user...');
  await User.create({
    name: 'LUXE Admin',
    email: 'admin@luxe.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
  });

  // Create sample customer
  await User.create({
    name: 'Priya Sharma',
    email: 'customer@luxe.com',
    password: 'customer123',
    role: 'customer',
    phone: '9876543210',
    isActive: true,
  });

  // Create categories
  console.log('📂 Creating categories...');
  const createdCategories = await Category.create(categories);
  const catMap = Object.fromEntries(createdCategories.map(c => [c.slug, c._id]));

  // Link subcategories to parents
  await Category.findByIdAndUpdate(catMap['mens-tshirts'], { parent: catMap['mens-clothing'] });
  await Category.findByIdAndUpdate(catMap['mens-jeans'], { parent: catMap['mens-clothing'] });
  await Category.findByIdAndUpdate(catMap['mens-shirts'], { parent: catMap['mens-clothing'] });
  await Category.findByIdAndUpdate(catMap['womens-dresses'], { parent: catMap['womens-clothing'] });
  await Category.findByIdAndUpdate(catMap['womens-tops'], { parent: catMap['womens-clothing'] });
  await Category.findByIdAndUpdate(catMap['womens-jeans'], { parent: catMap['womens-clothing'] });

  // Create products with category refs
  console.log('👕 Creating products...');
  const categoryAssignments = [
    catMap['mens-shirts'], catMap['mens-jeans'], catMap['womens-dresses'],
    catMap['mens-clothing'], catMap['womens-clothing'], catMap['mens-shirts'],
  ];
  const productsWithCats = sampleProducts.map((p, i) => ({
    ...p,
    category: categoryAssignments[i] || catMap['mens-clothing'],
  }));
  await Product.create(productsWithCats);

  // Create coupons
  console.log('🎫 Creating coupons...');
  await Coupon.create(coupons);

  // Create banners
  console.log('🖼️  Creating banners...');
  await Banner.create([
    {
      title: 'New Season Arrivals',
      subtitle: 'Discover the latest in luxury fashion',
      cta: { label: 'Shop Now', link: '/shop?isNewArrival=true' },
      image: { public_id: 'banner_1', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920' },
      position: 'hero',
      order: 1,
      isActive: true,
    },
    {
      title: "Women's Collection",
      subtitle: 'Elegance redefined for the modern woman',
      cta: { label: 'Explore', link: '/shop?gender=women' },
      image: { public_id: 'banner_2', url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920' },
      position: 'hero',
      order: 2,
      isActive: true,
    },
    {
      title: "Men's Essentials",
      subtitle: 'Classic pieces for every occasion',
      cta: { label: 'Shop Men', link: '/shop?gender=men' },
      image: { public_id: 'banner_3', url: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920' },
      position: 'hero',
      order: 3,
      isActive: true,
    },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('   Admin  — admin@luxe.com / admin123');
  console.log('   Customer — customer@luxe.com / customer123');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
