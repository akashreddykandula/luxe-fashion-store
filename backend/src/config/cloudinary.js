const cloudinary = require ('cloudinary').v2;
const {CloudinaryStorage} = require ('multer-storage-cloudinary');
const multer = require ('multer');

cloudinary.config ({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log ('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log ('API Key:', process.env.CLOUDINARY_API_KEY);
console.log (
  'Secret Length:',
  process.env.CLOUDINARY_API_SECRET
    ? process.env.CLOUDINARY_API_SECRET.length
    : 'undefined'
);

const productStorage = new CloudinaryStorage ({
  cloudinary,
  params: {
    folder: 'luxe/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {width: 1200, height: 1500, crop: 'limit', quality: 'auto'},
    ],
  },
});

const bannerStorage = new CloudinaryStorage ({
  cloudinary,
  params: {
    folder: 'luxe/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {width: 1920, height: 800, crop: 'limit', quality: 'auto'},
    ],
  },
});

const avatarStorage = new CloudinaryStorage ({
  cloudinary,
  params: {
    folder: 'luxe/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto'},
    ],
  },
});

const uploadProduct = multer ({
  storage: productStorage,
  limits: {fileSize: 5 * 1024 * 1024}, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith ('image/')) cb (null, true);
    else cb (new Error ('Only image files are allowed'), false);
  },
});

const uploadBanner = multer ({storage: bannerStorage});
const uploadAvatar = multer ({storage: avatarStorage});

const deleteImage = async publicId => {
  try {
    await cloudinary.uploader.destroy (publicId);
  } catch (err) {
    console.error ('Cloudinary delete error:', err);
  }
};

module.exports = {
  cloudinary,
  uploadProduct,
  uploadBanner,
  uploadAvatar,
  deleteImage,
};
