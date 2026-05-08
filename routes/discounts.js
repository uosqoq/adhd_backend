const router = require('express').Router();
const Discount = require('../models/Discount');
const { auth, adminOnly } = require('../middleware/auth');

// GET /api/discounts  — admin only
router.get('/', adminOnly, async (req, res) => {
  try {
    res.json(await Discount.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/discounts/validate  — authenticated (check a code at checkout)
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const discount = await Discount.findOne({ code: code.toUpperCase() });
    if (!discount) return res.status(404).json({ error: 'Invalid code' });
    if (discount.expires && new Date() > discount.expires)
      return res.status(400).json({ error: 'Code has expired' });
    if (orderTotal < discount.minOrder)
      return res.status(400).json({ error: `Minimum order $${discount.minOrder} required` });
    const saving = discount.type === 'percent'
      ? (orderTotal * discount.value) / 100
      : discount.value;
    res.json({ valid: true, discount, saving: Math.min(saving, orderTotal) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/discounts  — admin only
router.post('/', adminOnly, async (req, res) => {
  try {
    const discount = await Discount.create(req.body);
    res.status(201).json(discount);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/discounts/:id  — admin only
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
