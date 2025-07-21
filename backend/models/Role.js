const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    permissions: [{ type: String }]  // Example: ['read_patient_data', 'write_prescription']
});

module.exports = mongoose.model('Role', RoleSchema);
