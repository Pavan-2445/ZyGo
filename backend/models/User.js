const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    aadhaarId: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{12}$/,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    dob: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
