const router    = require('express').Router();
const multer    = require('multer');
const cloudinary = require('cloudinary').v2;
const { adminOnly } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store files in memory so we can stream directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per file
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// Upload a single image buffer to Cloudinary
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}

// POST /api/upload  — admin only, up to 8 images
// field name: "images"
router.post('/', adminOnly, upload.array('images', 8), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No files uploaded' });

    const results = await Promise.all(
      req.files.map(f => uploadToCloudinary(f.buffer, 'adhd-products'))
    );

    res.json({
      urls: results.map(r => r.secure_url),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/upload  — admin only, delete by public_id
router.delete('/', adminOnly, async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ error: 'publicId required' });
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
