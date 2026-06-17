const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { uploadProduct } = require('../config/cloudinary');
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  addProductImages, deleteProductImage, getFilterOptions,
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/filter-options', getFilterOptions);
router.get('/:slug', getProduct);

// Admin routes
router.post('/', protect, restrictTo('admin'), createProduct);
router.put('/:id', protect, restrictTo('admin'), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);
router.post('/:id/images', protect, restrictTo('admin'), uploadProduct.array('images', 8), addProductImages);
router.delete('/:id/images/:imageId', protect, restrictTo('admin'), deleteProductImage);

module.exports = router;
