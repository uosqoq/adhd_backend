const { Schema, model } = require('mongoose');

// Single-document settings store — always upsert the one doc with key 'global'
const settingsSchema = new Schema({
  key:             { type: String, default: 'global', unique: true },
  announcementBar: { type: String, default: 'Free shipping on orders over $150' },
  heroTitle:       { type: String, default: 'Wear Your Frequency.' },
  heroSub:         { type: String, default: 'Built for the divergent mind.' },
  heroCta:         { type: String, default: 'Shop Now' },
}, { timestamps: true });

module.exports = model('Settings', settingsSchema);
