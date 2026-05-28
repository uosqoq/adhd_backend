const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role:     { type: String, enum: ['customer', 'admin'], default: 'customer' },
  notes:    { type: String, default: '' },
  totpSecret:        { type: String, select: false },
  totpEnabled:       { type: Boolean, default: false },
  totpRecoveryCodes: { type: [String], select: false, default: [] },
}, { timestamps: true });

customerSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

customerSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = model('Customer', customerSchema);
