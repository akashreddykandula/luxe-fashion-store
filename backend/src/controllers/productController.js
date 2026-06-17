const Product = require('../models/Product');
const Category = require('../models/Category');
const { deleteImage } = require('../config/cloudinary');

// GET /api/products — with filtering, sorting, pagination, search
exports.getProducts = async (req, res) => {
  const {
    page = 1,
    limit = 12,
    sort = '-createdAt',
    category,
    gender,
    minPrice,
    maxPrice,
    sizes,
    colors,
    brand,
    rating,
    inStock,
    isFeatured,
    isNewArrival,
    isBestSeller,
    isTrending,
    isOnSale,
    search,
  } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) {
    // Support slug or ID
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      filter.category = category;
    } else {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
  }
  if (gender) filter.gender = gender;
  if (brand) filter.brand = { $regex: brand, $options: 'i' };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (sizes) filter.sizes = { $in: sizes.split(',') };
  if (colors) filter.colors = { $in: colors.split(',') };
  if (rating) filter['ratings.average'] = { $gte: Number(rating) };
  if (inStock === 'true') filter.stock = { $gt: 0 };
  if (isFeatured === 'true') filter.isFeatured = true;
  if (isNewArrival === 'true') filter.isNewArrival = true;
  if (isBestSeller === 'true') filter.isBestSeller = true;
  if (isTrending === 'true') filter.isTrending = true;
  if (isOnSale === 'true') filter.isOnSale = true;

  const sortMap = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'price-asc': 'price',
    'price-desc': '-price',
    rating: '-ratings.average',
    popular: '-soldCount',
    '-createdAt': '-createdAt',
  };
  const sortQuery = sortMap[sort] || sort;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort(sortQuery)
    .skip(skip)
    .limit(Number(limit))
    .select('-variants -specifications -careInstructions');

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    products,
  });
};

// GET /api/products/:slug
exports.getProduct = async (req, res) => {
  const product = await Product.findOne({
    $or: [{ slug: req.params.slug }, { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : null }],
    isActive: true,
  }).populate('category', 'name slug');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Related products
  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(8)
    .select('name slug price comparePrice images ratings');

  res.status(200).json({ success: true, product, related });
};

// POST /api/products — Admin only
exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
};

// PUT /api/products/:id — Admin only
exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.status(200).json({ success: true, product });
};

// DELETE /api/products/:id — Admin only
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  // Delete images from Cloudinary
  for (const img of product.images) {
    await deleteImage(img.public_id);
  }

  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted.' });
};

// POST /api/products/:id/images — Add images
exports.addProductImages = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const newImages = req.files.map((file, i) => ({
    public_id: file.filename,
    url: file.path,
    isDefault: product.images.length === 0 && i === 0,
  }));

  product.images.push(...newImages);
  await product.save();
  res.status(200).json({ success: true, images: product.images });
};

// DELETE /api/products/:id/images/:imageId
exports.deleteProductImage = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const image = product.images.id(req.params.imageId);
  if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });

  await deleteImage(image.public_id);
  image.deleteOne();
  await product.save();

  res.status(200).json({ success: true, message: 'Image deleted.' });
};

// GET /api/products/filters — Get available filter options
exports.getFilterOptions = async (req, res) => {
  const { category, gender } = req.query;
  const match = { isActive: true };
  if (category) match.category = category;
  if (gender) match.gender = gender;

  const [priceRange, sizes, colors, brands] = await Promise.all([
    Product.aggregate([
      { $match: match },
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
    ]),
    Product.distinct('sizes', match),
    Product.distinct('colors', match),
    Product.distinct('brand', match),
  ]);

  res.status(200).json({
    success: true,
    filters: {
      priceRange: priceRange[0] || { min: 0, max: 10000 },
      sizes: sizes.sort(),
      colors: colors.sort(),
      brands: brands.sort(),
    },
  });
};
