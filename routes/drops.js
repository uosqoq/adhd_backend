const router  = require('express').Router();
const Drop    = require('../models/Drop');
const { adminOnly } = require('../middleware/auth');

// Auto-flip 'upcoming' drops to 'active' once their date has passed.
// Side-effect runs lazily on each list fetch (no scheduler needed).
async function autoFlipStatuses() {
  const now = new Date();
  await Drop.updateMany(
    { status: 'upcoming', date: { $ne: null, $lte: now } },
    { $set: { status: 'active' } }
  );
}

// GET /api/drops — public
router.get('/', async (req, res) => {
  try {
    await autoFlipStatuses();
    const drops = await Drop.find().sort({ createdAt: -1 });
    res.json(drops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drops — admin only
router.post('/', adminOnly, async (req, res) => {
  try {
    const drop = await Drop.create(req.body);
    res.status(201).json(drop);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/drops/:id — admin only
router.patch('/:id', adminOnly, async (req, res) => {
  try {
    const drop = await Drop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!drop) return res.status(404).json({ error: 'Not found' });
    res.json(drop);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/drops/:id — admin only
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const drop = await Drop.findByIdAndDelete(req.params.id);
    if (!drop) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
