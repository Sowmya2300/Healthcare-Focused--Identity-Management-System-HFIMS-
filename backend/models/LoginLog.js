const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String }, // in case user doesn't exist or fails
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('LoginLog', LoginLogSchema);
