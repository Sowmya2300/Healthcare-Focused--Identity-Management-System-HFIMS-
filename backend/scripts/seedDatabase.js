const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const MedicalRecord = require("../models/MedicalRecord");
const PatientInfo = require("../models/PatientInfo");
const LabTest = require("../models/LabTest");
const Billing = require("../models/Billing");
const Appointment = require("../models/Appointment");
const ResearchData = require("../models/ResearchData");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected..."))
.catch(err => console.log("MongoDB Connection Error:", err));

// Hash passwords before storing users
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Seed Data Function
const seedDatabase = async () => {
    try {
        await User.deleteMany();
        await MedicalRecord.deleteMany();
        await PatientInfo.deleteMany();
        await LabTest.deleteMany();
        await Billing.deleteMany();
        await Appointment.deleteMany();

        console.log("Old Data Cleared. Seeding New Data...");

        // ✅ Create Users
        const rawUsers = [
            { username: "AdminUser", email: "admin@example.com", password: "Admin@123", role: "admin" },
          
            ...Array.from({ length: 10 }, (_, i) => ({
              username: `Dr.User${i + 1}`, email: `doctor${i + 1}@example.com`, password: "Doctor@123", role: "doctor"
            })),
          
            ...Array.from({ length: 10 }, (_, i) => ({
              username: `NurseUser${i + 1}`, email: `nurse${i + 1}@example.com`, password: "Nurse@123", role: "nurse"
            })),
          
            ...Array.from({ length: 10 }, (_, i) => ({
              username: `Patient${i + 1}`, email: `patient${i + 1}@example.com`, password: "Patient@123", role: "patient"
            })),
          
            ...Array.from({ length: 10 }, (_, i) => ({
              username: `Guardian${i + 1}`, email: `guardian${i + 1}@example.com`, password: "Guardian@123", role: "guardian"
            })),
          
            ...Array.from({ length: 10 }, (_, i) => ({
              username: `BillingStaff${i + 1}`, email: `billing${i + 1}@example.com`, password: "Billing@123", role: "staff", staffType: "billing"
            })),
          
            ...Array.from({ length: 10 }, (_, i) => ({
              username: `MedicalStaff${i + 1}`, email: `medical${i + 1}@example.com`, password: "Medical@123", role: "staff", staffType: "medical"
            })),
          
            ...Array.from({ length: 10 }, (_, i) => ({
              username: `Researcher${i + 1}`, email: `researcher${i + 1}@example.com`, password: "Researcher@123", role: "researcher"
            })),
          ];
          
          // ✅ Hash all passwords correctly (once)
          const users = await Promise.all(
            rawUsers.map(async user => ({
              ...user,
              password: await hashPassword(user.password),
              isDeleted: false
            }))
          );
          
          const insertedUsers = await User.insertMany(users);          
        console.log("✅ Users Seeded Successfully!");

        // ✅ Assign Doctors & Nurses to Patients
        const doctors = insertedUsers.filter(user => user.role === "doctor");
        const nurses = insertedUsers.filter(user => user.role === "nurse");
        const patients = insertedUsers.filter(user => user.role === "patient");

        for (let i = 0; i < patients.length; i++) {
            const assignedDoctor = doctors[i % doctors.length];
            const assignedNurse = nurses[i % nurses.length];

            await User.findByIdAndUpdate(patients[i]._id, {
                assignedPatients: [assignedDoctor._id],
            });

            console.log(`Assigned Dr.${assignedDoctor.username} & Nurse.${assignedNurse.username} to Patient.${patients[i].username}`);
        }

        // ✅ Seed Medical Records
        const medicalRecords = patients.map(patient => ({
            patient: patient._id,
            doctor: doctors[Math.floor(Math.random() * doctors.length)]._id,
            diagnosis: "General Checkup",
            treatment: "Rest & Hydration",
            medications: ["Vitamin C", "Paracetamol"],
            doctorNotes: "Regular follow-up needed"
        }));

        await MedicalRecord.insertMany(medicalRecords);
        console.log("Medical Records Seeded");

        // ✅ Seed Lab Tests
        const labTests = patients.map(patient => ({
            patient: patient._id,
            doctor: doctors[Math.floor(Math.random() * doctors.length)]._id,
            testName: "Blood Test",
            status: "completed",
            results: "All values normal"
        }));

        await LabTest.insertMany(labTests);
        console.log("Lab Tests Seeded");

         // ✅ Seed Patient Info
         const patientInfoRecords = patients.map(patient => ({
            user: patient._id, // Link to the Patient user
            age: 20 + Math.floor(Math.random() * 40), // Random age between 20-60
            gender: ["male", "female", "other"][Math.floor(Math.random() * 3)], // Random gender
            contactInfo: `+91 98765432${Math.floor(10 + Math.random() * 89)}`, // Random phone number
            allergies: ["Pollen", "Dust", "Peanuts"].slice(0, Math.floor(Math.random() * 3)), // Random allergies
            chronicDiseases: ["Diabetes", "Hypertension", "Asthma"].slice(0, Math.floor(Math.random() * 3)), // Random chronic diseases
            emergencyContact: {
                name: `Emergency Contact ${patient.username}`,
                phone: `+91 98765432${Math.floor(10 + Math.random() * 89)}`
            },
        }));

        await PatientInfo.insertMany(patientInfoRecords);
        console.log("✅ Patient Info Seeded Successfully!");

        // ✅ Seed Billing
        const billingRecords = patients.map(patient => ({
            patient: patient._id,
            amount: 500 + Math.floor(Math.random() * 1000),
            status: "unpaid",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            insuranceClaim: { provider: "ABC Insurance", claimStatus: "pending", claimAmount: 300 }
        }));

        await Billing.insertMany(billingRecords);
        console.log("Billing Records Seeded");

        // ✅ Seed Appointments
        const appointments = patients.map(patient => ({
            patient: patient._id,
            doctor: doctors[Math.floor(Math.random() * doctors.length)]._id,
            date: new Date(Date.now() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
            status: "scheduled"
        }));

        await Appointment.insertMany(appointments);
        console.log("Appointments Seeded");

        // ✅ Seed Research Data
        const researchData = [];
        const researchers = insertedUsers.filter(user => user.role === "researcher");
        const admins = insertedUsers.filter(user => user.role === "admin");
        for (let i = 0; i < 10; i++) {
            researchData.push({
                studyID: `STUDY-${1000 + i}`,
                title: `Research Study ${i + 1}`,
                description: `A detailed study on AI-powered security in healthcare - Phase ${i + 1}`,
                anonymizedRecords: [medicalRecords[i % medicalRecords.length]._id], // Link to medical records
                createdBy: i % 2 === 0 ? researchers[i % researchers.length]._id : admins[0]._id, // Alternating between researchers & admin
            });
        }

        await ResearchData.insertMany(researchData);
        console.log("✅ Research Data Seeded Successfully!");

        console.log("Database Seeding Complete!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Seeding Error:", error);
        mongoose.connection.close();
    }
};

// Run Seeding
seedDatabase();
