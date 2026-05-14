const router = require('express').Router();
const Media = require('../models/Media');
const cloudinary = require('cloudinary').v2;
const { adminOnly } = require('../middleware/auth');

// GET /api/media  — admin only, list all
router.get('/', adminOnly, async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/media/:id  — admin only (alt text)
router.patch('/:id', adminOnly, async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { alt: req.body.alt },
      { new: true }
    );
    if (!media) return res.status(404).json({ error: 'Not found' });
    res.json(media);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/media/:id  — admin only, removes Cloudinary asset + DB record
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Not found' });
    if (media.publicId) {
      try { await cloudinary.uploader.destroy(media.publicId); } catch (e) { /* ignore Cloudinary errors */ }
    }
    await Media.deleteOne({ _id: media._id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
