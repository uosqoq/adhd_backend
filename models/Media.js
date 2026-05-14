const { Schema, model } = require('mongoose');

const mediaSchema = new Schema({
  url:          { type: String, required: true },
  publicId:     { type: String, default: '' },
  originalName: { type: String, default: '' },
  folder:       { type: String, default: '' },
  alt:          { type: String, default: '' },
  bytes:        { type: Number, default: 0 },
  width:        { type: Number, default: 0 },
  height:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = model('Media', mediaSchema);
