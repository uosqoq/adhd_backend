const router = require('express').Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET, { expiresIn: '7d' });

const signChallenge = (user) =>
  jwt.sign({ id: user._id, purpose: '2fa' }, process.env.JWT_SECRET, { expiresIn: '5m' });

const verifyTotp = (secret, token) =>
  speakeasy.totp.verify({ secret, encoding: 'base32', token: String(token).trim(), window: 1 });

const generateRecoveryCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(5).toString('hex'));
  }
  return codes;
};

const hashRecoveryCode = (code) =>
  bcrypt.hash(String(code).trim().toLowerCase().replace(/-/g, ''), 10);

const matchRecoveryCode = async (input, hashes) => {
  const normalized = String(input).trim().toLowerCase().replace(/-/g, '');
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(normalized, hashes[i])) return i;
  }
  return -1;
};

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

    if (customer.totpEnabled) {
      return res.json({ requires2fa: true, challengeToken: signChallenge(customer) });
    }

    res.json({ token: sign(customer), user: { id: customer._id, name: customer.name, email, role: customer.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login/verify-2fa
router.post('/login/verify-2fa', async (req, res) => {
  try {
    const { challengeToken, code, recoveryCode } = req.body;
    if (!challengeToken || (!code && !recoveryCode))
      return res.status(400).json({ error: 'Challenge token and code required' });

    let payload;
    try {
      payload = jwt.verify(challengeToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Challenge expired — log in again' });
    }
    if (payload.purpose !== '2fa')
      return res.status(401).json({ error: 'Invalid challenge token' });

    const customer = await Customer.findById(payload.id).select('+totpSecret +totpRecoveryCodes');
    if (!customer || !customer.totpEnabled)
      return res.status(401).json({ error: 'Invalid challenge' });

    if (recoveryCode) {
      const idx = await matchRecoveryCode(recoveryCode, customer.totpRecoveryCodes || []);
      if (idx === -1) return res.status(401).json({ error: 'Invalid recovery code' });
      customer.totpRecoveryCodes.splice(idx, 1);
      await customer.save();
    } else if (!verifyTotp(customer.totpSecret, code)) {
      return res.status(401).json({ error: 'Invalid authentication code' });
    }

    res.json({
      token: sign(customer),
      user: { id: customer._id, name: customer.name, email: customer.email, role: customer.role },
      recoveryCodesRemaining: customer.totpRecoveryCodes.length,
    });
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

// PATCH /api/auth/change-password  (authenticated user changes own password)
router.patch('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Current and new password are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const customer = await Customer.findById(req.user.id).select('+password');
    if (!customer)
      return res.status(404).json({ error: 'Account not found' });
    if (!(await customer.comparePassword(currentPassword)))
      return res.status(401).json({ error: 'Current password is incorrect' });

    customer.password = newPassword;
    await customer.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/2fa/status
router.get('/2fa/status', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('+totpRecoveryCodes');
    if (!customer) return res.status(404).json({ error: 'Account not found' });
    res.json({
      enabled: !!customer.totpEnabled,
      recoveryCodesRemaining: (customer.totpRecoveryCodes || []).length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/2fa/setup  (generate secret + QR; does not enable yet)
router.post('/2fa/setup', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer) return res.status(404).json({ error: 'Account not found' });
    if (customer.totpEnabled)
      return res.status(409).json({ error: '2FA is already enabled — disable it first to re-enroll' });

    const secret = speakeasy.generateSecret({
      name: `ADHD (${customer.email})`,
      issuer: 'ADHD',
      length: 20,
    });
    customer.totpSecret = secret.base32;
    await customer.save();

    const otpauthUrl = secret.otpauth_url;
    const qrDataUrl = await qrcode.toDataURL(otpauthUrl);
    res.json({ secret: secret.base32, otpauthUrl, qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/2fa/enable  (verify code, flip enabled, return recovery codes)
router.post('/2fa/enable', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const customer = await Customer.findById(req.user.id).select('+totpSecret');
    if (!customer) return res.status(404).json({ error: 'Account not found' });
    if (customer.totpEnabled)
      return res.status(409).json({ error: '2FA is already enabled' });
    if (!customer.totpSecret)
      return res.status(400).json({ error: 'Call /2fa/setup first' });
    if (!verifyTotp(customer.totpSecret, code))
      return res.status(401).json({ error: 'Invalid authentication code' });

    const plainCodes = generateRecoveryCodes();
    customer.totpRecoveryCodes = await Promise.all(plainCodes.map(hashRecoveryCode));
    customer.totpEnabled = true;
    await customer.save();

    res.json({ ok: true, recoveryCodes: plainCodes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/2fa/disable  (requires password + current code)
router.post('/2fa/disable', auth, async (req, res) => {
  try {
    const { password, code } = req.body;
    if (!password || !code)
      return res.status(400).json({ error: 'Password and code are required' });

    const customer = await Customer.findById(req.user.id).select('+password +totpSecret');
    if (!customer) return res.status(404).json({ error: 'Account not found' });
    if (!customer.totpEnabled)
      return res.status(409).json({ error: '2FA is not enabled' });
    if (!(await customer.comparePassword(password)))
      return res.status(401).json({ error: 'Password is incorrect' });
    if (!verifyTotp(customer.totpSecret, code))
      return res.status(401).json({ error: 'Invalid authentication code' });

    customer.totpEnabled = false;
    customer.totpSecret = undefined;
    customer.totpRecoveryCodes = [];
    await customer.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
