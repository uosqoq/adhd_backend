const router = require('express').Router();
const Customer = require('../models/Customer');
const { auth, adminOnly } = require('../middleware/auth');

// GET /api/customers  — admin only
router.get('/', adminOnly, async (req, res) => {
  try {
    const customers = await Customer.find({ role: 'customer' }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/me  — own profile
router.get('/me', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/customers/me  — update own profile
router.patch('/me', auth, async (req, res) => {
  try {
    const allowed = { name: req.body.name };
    if (req.body.password) allowed.password = req.body.password;
    const customer = await Customer.findByIdAndUpdate(req.user.id, allowed, { new: true });
    res.json({ id: customer._id, name: customer.name, email: customer.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
