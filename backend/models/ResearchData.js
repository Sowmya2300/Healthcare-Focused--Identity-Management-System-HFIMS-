const mongoose = require("mongoose");

const ResearchDataSchema = new mongoose.Schema({
    studyID: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    anonymizedRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: "MedicalRecord" }], // Anonymized patient data
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Researcher/Admin who created it
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false } // Soft delete flag
});

module.exports = mongoose.model("ResearchData", ResearchDataSchema);
