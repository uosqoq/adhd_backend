const { Schema, model } = require('mongoose');

// Single-document settings store — always upsert the one doc with key 'global'
const settingsSchema = new Schema({
  key:             { type: String, default: 'global', unique: true },
  announcementBar: { type: String, default: 'Free shipping on orders over $150' },
  heroEyebrow:     { type: String, default: '에드헤드 — Spring / Summer 2026' },
  heroTitle:       { type: String, default: 'Wear Your Frequency.' },
  heroSub:         { type: String, default: 'Built for the divergent mind.' },
  heroCta:         { type: String, default: 'Shop Now' },
  heroCtaLink:     { type: String, default: 'shop.html' },
  heroCta2:        { type: String, default: 'View Drops' },
  heroCta2Link:    { type: String, default: 'drops.html' },
  heroImage:       { type: String, default: '' },
  shopHidden:      { type: Boolean, default: false },
  marqueeItems:    { type: [String], default: [] },
  social: {
    instagram: { type: String, default: '' },
    tiktok:    { type: String, default: '' },
    twitter:   { type: String, default: '' },
    email:     { type: String, default: '' },
  },
  pages: {
    about: {
      eyebrow:    { type: String, default: '' },
      title:      { type: String, default: '' },
      intro:      { type: [String], default: [] },
      quote:      { type: String, default: '' },
      quoteBy:    { type: String, default: '' },
      values: {
        type: [{ num: String, title: String, text: String }],
        default: [],
      },
    },
    contact: {
      eyebrow: { type: String, default: '' },
      title:   { type: String, default: '' },
      sub:     { type: String, default: '' },
      emails: {
        type: [{ label: String, address: String }],
        default: [],
      },
    },
    policies: {
      shipping: {
        title: { type: String, default: 'Shipping' },
        body:  { type: String, default: '' },
      },
      returns: {
        title: { type: String, default: 'Returns' },
        body:  { type: String, default: '' },
      },
    },
    sizeGuide: {
      eyebrow: { type: String, default: 'Size Guide' },
      title:   { type: String, default: 'Find your fit.' },
      intro:   { type: String, default: '' },
      tables: {
        type: [{
          name:    String,    // e.g. "Tops", "Bottoms"
          headers: [String],  // ["Size", "Chest", "Length"]
          rows:    [[String]],// [["S","36-38","27"], ...]
        }],
        default: [],
      },
      notes: { type: String, default: '' },
    },
  },
}, { timestamps: true });

module.exports = model('Settings', settingsSchema);
