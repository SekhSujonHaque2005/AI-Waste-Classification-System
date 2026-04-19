const mongoose = require('mongoose');

const wasteScanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Optional for guest mode
  imageUrl: { type: String, required: true },
  wasteType: { type: String, required: true },
  confidence: { type: Number, required: true },
  recyclingInstructions: [{ type: String }],
  environmentalImpact: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WasteScan', wasteScanSchema);
