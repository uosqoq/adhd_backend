const router = require('express').Router();
const Category = require('../models/Category');
const { adminOnly } = require('../middleware/auth');

const DEFAULTS = [
  { slug: 'tops',        label: 'Tops',        order: 1 },
  { slug: 'outerwear',   label: 'Outerwear',   order: 2 },
  { slug: 'bottoms',     label: 'Bottoms',     order: 3 },
  { slug: 'accessories', label: 'Accessories', order: 4 },
];

// GET /api/categories  — public, auto-seeds defaults if empty
router.get('/', async (req, res) => {
  try {
    let categories = await Category.find().sort({ order: 1, label: 1 });
    if (!categories.length) {
      await Category.insertMany(DEFAULTS);
      categories = await Category.find().sort({ order: 1, label: 1 });
    }
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories  — admin
router.post('/', adminOnly, async (req, res) => {
  try {
    const slug = (req.body.slug || req.body.label || '').toLowerCase().trim().replace(/\s+/g, '-');
    const category = await Category.create({
      slug,
      label: req.body.label,
      order: req.body.order || 0,
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/categories/:id  — admin
router.patch('/:id', adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id  — admin
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
