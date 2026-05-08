// Run once: node seed.js
// Seeds the DB with default products and admin account
require('dotenv').config();
const connect = require('./db');
const Product  = require('./models/Product');
const Customer = require('./models/Customer');

const products = [
  { name: 'Hyperfocus Oversized Tee',    sub: '에드헤드 — Vol. 3', price: 65,  category: 'tops',        badge: 'New',       stock: 24, image: '에' },
  { name: 'Divergent Bomber Jacket',      sub: '에드헤드 — Vol. 3', price: 295, category: 'outerwear',   badge: 'New',       stock: 8,  image: 'AD' },
  { name: 'Focus Mode Cargo Pants',       sub: '에드헤드 — Vol. 2', price: 185, category: 'bottoms',     badge: '',          stock: 15, image: 'HD' },
  { name: '에드헤드 6-Panel Cap',          sub: '에드헤드 — Accessories', price: 55, category: 'accessories', badge: 'New',  stock: 40, image: '드' },
  { name: 'Scattered Thoughts Hoodie',    sub: '에드헤드 — Vol. 2', price: 145, category: 'tops',        badge: '',          stock: 11, image: '헤' },
  { name: 'Dopamine Crewneck',            sub: '에드헤드 — Vol. 1', price: 125, category: 'tops',        badge: '',          stock: 6,  image: '드' },
  { name: 'Signal Tote Bag',              sub: '에드헤드 — Accessories', price: 45, category: 'accessories', badge: '',     stock: 33, image: 'AD' },
  { name: 'Impulse Control Shorts',       sub: '에드헤드 — Vol. 2', price: 95,  category: 'bottoms',     badge: 'Low Stock', stock: 3,  image: 'HD' },
  { name: 'Attention Span Coach Jacket',  sub: '에드헤드 — Vol. 2', price: 245, category: 'outerwear',   badge: '',          stock: 9,  image: '에' },
  { name: 'Intrusive Thoughts L/S Tee',   sub: '에드헤드 — Vol. 1', price: 75,  category: 'tops',        badge: '',          stock: 18, image: '드' },
  { name: 'Frequency Beanie',             sub: '에드헤드 — Accessories', price: 38, category: 'accessories', badge: '',     stock: 27, image: 'HD' },
  { name: 'Restless Legs Track Pants',    sub: '에드헤드 — Vol. 3', price: 135, category: 'bottoms',     badge: 'New',       stock: 20, image: '에' },
];

(async () => {
  await connect();

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);

  const adminExists = await Customer.findOne({ email: 'admin@adhd-brand.com' });
  if (!adminExists) {
    await Customer.create({ name: 'Admin', email: 'admin@adhd-brand.com', password: 'adhd2026', role: 'admin' });
    console.log('Admin account created: admin@adhd-brand.com / adhd2026');
  } else {
    console.log('Admin already exists, skipping');
  }

  console.log('Seed complete');
  process.exit(0);
})();
