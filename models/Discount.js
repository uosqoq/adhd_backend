const { Schema, model } = require('mongoose');

const discountSchema = new Schema({
  code:     { type: String, required: true, unique: true, uppercase: true },
  type:     { type: String, enum: ['percent', 'fixed'], required: true },
  value:    { type: Number, required: true },
  minOrder: { type: Number, default: 0 },
  expires:  { type: Date, default: null },
}, { timestamps: true });

module.exports = model('Discount', discountSchema);
