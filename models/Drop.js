const { Schema, model } = require('mongoose');

const dropSchema = new Schema({
  title:       { type: String, required: true },
  season:      { type: String, default: '' },
  description: { type: String, default: '' },
  date:        { type: Date },
  status:      { type: String, enum: ['upcoming', 'active', 'sold-out'], default: 'upcoming' },
  images:      [{ type: String }],
}, { timestamps: true });

module.exports = model('Drop', dropSchema);
