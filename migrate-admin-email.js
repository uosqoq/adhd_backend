// Run once: node migrate-admin-email.js
// Updates the existing admin account email to admin@adhd-club.com
require('dotenv').config();
const connect = require('./db');
const Customer = require('./models/Customer');

(async () => {
  await connect();
  const result = await Customer.updateOne(
    { role: 'admin' },
    { $set: { email: 'admin@adhd-club.com' } }
  );
  if (result.modifiedCount) {
    console.log('Admin email updated to admin@adhd-club.com');
  } else {
    console.log('No admin account found to update (already updated or not seeded yet)');
  }
  process.exit(0);
})();
