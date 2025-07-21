const mongoose = require('mongoose');

const PatientInfoSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to Patient
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    contactInfo: { type: String, required: true },
    allergies: [{ type: String }], // List of allergies
    chronicDiseases: [{ type: String }], // List of chronic conditions
    emergencyContact: { 
        name: { type: String, required: true },
        phone: { type: String, required: true }
    },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('PatientInfo', PatientInfoSchema);
