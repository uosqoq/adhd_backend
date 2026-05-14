const { Schema, model } = require('mongoose');

const categorySchema = new Schema({
  slug:  { type: String, required: true, unique: true, lowercase: true, trim: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = model('Category', categorySchema);
