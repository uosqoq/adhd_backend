const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    const existing = await Customer.findOne({ email });
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists' });

    const customer = await Customer.create({ name, email, password });
    res.status(201).json({ token: sign(customer), user: { id: customer._id, name, email, role: customer.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email }).select('+password');
    if (!customer || !(await customer.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ token: sign(customer), user: { id: customer._id, name: customer.name, email, role: customer.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me  (verify token + return user)
router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    res.json(payload);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
