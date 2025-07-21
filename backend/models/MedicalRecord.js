const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visitDate: { type: Date, required: true, default: Date.now },
    diagnosis: { type: String, required: true },
    treatment: { type: String },
    medications: [{ type: String }], // List of prescribed medications
    doctorNotes: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
