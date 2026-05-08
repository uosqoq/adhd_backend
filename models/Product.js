const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  name:     { type: String, required: true },
  sub:      { type: String, default: '' },
  price:    { type: Number, required: true },
  category: { type: String, enum: ['tops', 'outerwear', 'bottoms', 'accessories'], required: true },
  badge:    { type: String, default: '' },
  stock:    { type: Number, default: 0 },
  image:    { type: String, default: '' },   // legacy placeholder character
  images:   [{ type: String }],              // Cloudinary URLs, up to 8
}, { timestamps: true });

module.exports = model('Product', productSchema);
