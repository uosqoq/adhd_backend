const router = require('express').Router();
const Order = require('../models/Order');
const { auth, adminOnly } = require('../middleware/auth');

// GET /api/orders  — admin sees all; customer sees own
router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { email: req.user.email };
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id  — admin or order owner
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.email !== req.user.email)
      return res.status(403).json({ error: 'Forbidden' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders  — authenticated customers
router.post('/', auth, async (req, res) => {
  try {
    const order = await Order.create({
      customer: req.user.name,
      email:    req.user.email,
      ...req.body,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status  — admin only
router.patch('/:id/status', adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/orders/:id  — admin only (tracking, carrier, notes, shipping, lineItems)
router.patch('/:id', adminOnly, async (req, res) => {
  try {
    const allowed = (({ tracking, carrier, notes, shipping, lineItems, status }) =>
      ({ tracking, carrier, notes, shipping, lineItems, status }))(req.body);
    Object.keys(allowed).forEach(k => allowed[k] === undefined && delete allowed[k]);
    const order = await Order.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/orders/:id/refund  — admin only
router.post('/:id/refund', adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'Refunded', refundedAt: new Date(), refundReason: req.body.reason || '' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
