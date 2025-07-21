const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Patient being billed
    amount: { type: Number, required: true }, // Bill amount
    status: { type: String, enum: ['paid', 'unpaid', 'pending'], default: 'unpaid' }, // Payment status
    issuedDate: { type: Date, default: Date.now }, // Date bill was issued
    dueDate: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false }, 

    // Insurance Claims Section
    insuranceClaim: {
        provider: { type: String }, // Insurance Company Name
        claimStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        claimAmount: { type: Number }
    }

}, { timestamps: true });

module.exports = mongoose.model('Billing', BillingSchema);
