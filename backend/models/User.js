const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'doctor', 'nurse', 'patient', 'guardian', 'staff', 'researcher'], required: true },

    // Only for Staff (Billing or Medical)
    staffType: { type: String, enum: ['billing', 'medical'], default: null },

    // Only for Patients
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    contactInfo: { type: String },

    // Only for Guardians
    guardianFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of assigned patients

    // Only for Doctors & Nurses
    assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of assigned patients

    isDeleted: {
        type: Boolean,
        default: false
      },      

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
