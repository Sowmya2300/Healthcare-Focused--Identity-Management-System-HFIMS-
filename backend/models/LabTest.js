const mongoose = require('mongoose');

const LabTestSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Patient undergoing the test
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Doctor who ordered the test
    testName: { type: String, required: true }, // Name of the lab test (e.g., Blood Test, MRI)
    testDate: { type: Date, required: true, default: Date.now }, // Date test was conducted
    results: { type: String }, // Test result description or a link to report file
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    isDeleted: { type: Boolean, default: false } // Test status
}, { timestamps: true });

module.exports = mongoose.model('LabTest', LabTestSchema);
