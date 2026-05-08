const router = require('express').Router();
const Settings = require('../models/Settings');
const { adminOnly } = require('../middleware/auth');

// GET /api/settings  — public (storefront reads this)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) settings = await Settings.create({ key: 'global' });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/settings  — admin only
router.patch('/', adminOnly, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
