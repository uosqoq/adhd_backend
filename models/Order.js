const { Schema, model } = require('mongoose');

const lineItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  name:      { type: String, required: true },
  size:      { type: String, default: '' },
  qty:       { type: Number, default: 1, min: 1 },
  price:     { type: Number, required: true },
  image:     { type: String, default: '' },
}, { _id: false });

const addressSchema = new Schema({
  line1:    { type: String, default: '' },
  line2:    { type: String, default: '' },
  city:     { type: String, default: '' },
  region:   { type: String, default: '' },
  postal:   { type: String, default: '' },
  country:  { type: String, default: '' },
}, { _id: false });

const orderSchema = new Schema({
  customer:    { type: String, required: true },
  email:       { type: String, required: true },
  items:       [{ type: String }],            // legacy summary strings
  lineItems:   [lineItemSchema],              // structured items
  shipping:    { type: addressSchema, default: () => ({}) },
  total:       { type: Number, required: true },
  status:      { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Refunded'], default: 'Processing' },
  tracking:    { type: String, default: '' },
  carrier:     { type: String, default: '' },
  notes:       { type: String, default: '' },
  refundedAt:  { type: Date, default: null },
  refundReason:{ type: String, default: '' },
}, { timestamps: true });

module.exports = model('Order', orderSchema);
