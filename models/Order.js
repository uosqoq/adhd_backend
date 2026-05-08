const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
  customer: { type: String, required: true },
  email:    { type: String, required: true },
  items:    [{ type: String }],
  total:    { type: Number, required: true },
  status:   { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Refunded'], default: 'Processing' },
}, { timestamps: true });

module.exports = model('Order', orderSchema);
