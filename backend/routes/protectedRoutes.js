const express = require("express");
const authorizeRoles = require("../middleware/roleMiddleware");
const authenticateUser = require('../middleware/authMiddleware');
const MedicalRecord = require("../models/MedicalRecord");
const PatientInfo = require("../models/PatientInfo");
const ResearchData = require("../models/ResearchData");
const Billing = require("../models/Billing");
const Appointment = require("../models/Appointment");
const LabTest = require("../models/LabTest");
const User = require("../models/User");
const LoginLog = require('../models/LoginLog');
const bcrypt = require("bcryptjs");
const blockchain = require('../../blockchain/ledger/blockchain');
const fs = require('fs');
const { exec } = require("child_process");
const path = require('path');

const router = express.Router();

// ======================= CREATE =======================

// Create a new user (Admin Only)
router.post('/users', authenticateUser, authorizeRoles('admin'), async (req, res) => {
    try {
      const { username, email, password, role, staffType, age, gender, contactInfo } = req.body;
  
      // Basic validations
      if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "Missing required fields." });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role,
        staffType,
        age,
        gender,
        contactInfo,
        isDeleted: false
      });
  
      await newUser.save();
      res.status(201).json({ message: 'User created successfully', newUser });
      blockchain.createBlock({
        userId: req.user.userId,
        action: "CREATE_USER",
        details: {
          username: newUser.username,
          role: newUser.role,
        }});
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user', error });
    }
  });

// Medical Record
router.post("/medical-records", authorizeRoles("admin","doctor", "nurse"), async (req, res) => {
    try {
      const newRecord = new MedicalRecord(req.body);
      await newRecord.save();
  
      blockchain.createBlock({
        userId: req.user.userId,
        action: "CREATE_MEDICAL_RECORD",
        details: {
          patient: newRecord.patient.username,
          doctor: newRecord.doctor.username,
          diagnosis: newRecord.diagnosis,
        }
      });
  
      res.status(201).json({ message: "Medical record created successfully.", newRecord });
    } catch (error) {
      res.status(500).json({ message: "Error creating medical record.", error});
    }
  });

// Appointment
router.post("/appointments", authorizeRoles("admin", "doctor"), async (req, res) => {
    try {
      const newAppointment = new Appointment(req.body);
      await newAppointment.save();
  
      blockchain.createBlock({
        userId: req.user.userId,
        action: "CREATE_APPOINTMENT",
        details: {
          patient: newAppointment.patient,
          doctor: newAppointment.doctor,
          date: newAppointment.date,
          status: newAppointment.status
        }
      });
  
      res.status(201).json({ message: "Appointment created successfully.", newAppointment });
    } catch (error) {
      res.status(500).json({ message: "Error creating appointment.", error });
    }
  });

// Lab Test
router.post("/lab-tests", authorizeRoles("staff"), async (req, res) => {
    try {
      const newLabTest = new LabTest(req.body);
      await newLabTest.save();
  
      blockchain.createBlock({
        userId: req.user.userId,
        action: "CREATE_LAB_TEST",
        details: {
          patient: newLabTest.patient,
          testName: newLabTest.testName,
          result: newLabTest.result,
          date: newLabTest.date
        }
      });
  
      res.status(201).json({ message: "Lab test created successfully.", newLabTest });
    } catch (error) {
      res.status(500).json({ message: "Error creating lab test.", error });
    }
  });

// Billing
router.post("/billing-info", authorizeRoles("staff"), async (req, res) => {
    try {
      const newBilling = new Billing(req.body);
      await newBilling.save();
  
      blockchain.createBlock({
        userId: req.user.userId,
        action: "CREATE_BILLING",
        details: {
          patient: newBilling.patient,
          amount: newBilling.amount,
          date: newBilling.date,
          status: newBilling.status
        }
      });
  
      res.status(201).json({ message: "Billing record created successfully.", newBilling });
    } catch (error) {
      res.status(500).json({ message: "Error creating billing record.", error });
    }
  });

// ======================= READ & SEARCH =======================

// All Users (admin only)
router.get("/users", authorizeRoles("admin"), async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false }, "-password");
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users.", error });
    }
});

// Search Users
router.get("/users/search", authorizeRoles("admin"), async (req, res) => {
    try {
        const { query } = req.query;
        const users = await User.find({
            isDeleted: false,
            $or: [
                { username: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { role: { $regex: query, $options: "i" } }
            ]
        }, "-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error searching users." });
    }
});

// Medical Records
router.get("/medical-records", authorizeRoles("admin", "doctor", "nurse", "patient"), async (req, res) => {
    try {
        const filter = { isDeleted: false };
        if (req.user.role === "patient") {
            filter.patient = req.user.userId;
        }

        const records = await MedicalRecord.find(filter)
            .populate('patient', 'username')
            .populate('doctor', 'username');

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: "Error fetching medical records." });
    }
});

// Search Medical Records
router.get("/medical-records/search", authorizeRoles("admin", "doctor", "nurse"), async (req, res) => {
    try {
        const { query } = req.query;

        // Find users that match the search term
        const matchingUsers = await User.find({
            isDeleted: false,
            $or: [
                { username: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        }, '_id');

        const userIds = matchingUsers.map(user => user._id);

        const records = await MedicalRecord.find({
            isDeleted: false,
            $or: [
                { patient: { $in: userIds } },
                { doctor: { $in: userIds } },
                { diagnosis: { $regex: query, $options: "i" } },
                { treatment: { $regex: query, $options: "i" } },
                { doctorNotes: { $regex: query, $options: "i" } }
            ]
        })
        .populate("patient", "username")
        .populate("doctor", "username");

        res.json(records);
    } catch (error) {
        console.error("Error searching medical records:", error);
        res.status(500).json({ message: "Error searching medical records." });
    }
});

// Patient Info
router.get("/patient-data", authorizeRoles("admin", "doctor", "nurse", "patient", "guardian"), async (req, res) => {
    try {
        if (req.user.role === "patient") {
            const patientData = await PatientInfo.findOne({ user: req.user.userId, isDeleted: false })
                .populate("user", "username");
            return res.json(patientData);
        }

        const patientData = await PatientInfo.find({ isDeleted: false }).populate("user", "username");
        res.json(patientData);
    } catch (error) {
        res.status(500).json({ message: "Error fetching patient data." });
    }
});

// Search Patient Info
router.get("/patient-data/search", authorizeRoles("admin", "doctor", "nurse", "guardian"), async (req, res) => {
    try {
        const { query } = req.query;

        const records = await PatientInfo.find({ isDeleted: false }).populate("user", "username");

        const filtered = records.filter(record =>
            record.user?.username?.toLowerCase().includes(query.toLowerCase())
        );

        res.json(filtered);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: "Error searching patient data." });
    }
});


// Billing Info
router.get("/billing-info", authorizeRoles("admin", "staff", "patient", "guardian"), async (req, res) => {
    try {
        const filter = { isDeleted: false };
        if (["patient", "guardian"].includes(req.user.role)) {
            filter.patient = req.user.userId;
        }

        const billing = await Billing.find(filter).populate("patient", "username");
        res.json(billing);
    } catch (error) {
        res.status(500).json({ message: "Error fetching billing info." });
    }
});

// Appointments
router.get("/appointments", authorizeRoles("admin", "doctor", "patient", "guardian", "staff"), async (req, res) => {
    try {
        const filter = { isDeleted: false };
        if (req.user.role === "doctor") filter.doctor = req.user.userId;
        if (["patient", "guardian"].includes(req.user.role)) filter.patient = req.user.userId;

        const appointments = await Appointment.find(filter).populate("doctor", "username").populate("patient", "username");
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments." });
    }
});

// Lab Tests
router.get("/lab-tests", authorizeRoles("admin", "doctor", "nurse", "patient", "guardian", "staff"), async (req, res) => {
    try {
        const filter = { isDeleted: false };
        if (["patient", "guardian"].includes(req.user.role)) filter.patient = req.user.userId;

        const labTests = await LabTest.find(filter).populate("doctor", "username").populate("patient", "username");
        res.json(labTests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching lab tests." });
    }
});

// ======================= UPDATE =======================

// Update existing user (Admin Only)
router.put('/users/:id', authenticateUser, authorizeRoles('admin'), async (req, res) => {
    try {
      const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json({ message: "User updated successfully", updated });
      blockchain.createBlock({
        userId: req.user.userId,
        action: "UPDATE_USER",
        details: {
          updatedUserId: req.params.id,
          updates: req.body
        }
      });      
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user", error });
    }
  });

router.put("/medical-records/:id", authorizeRoles('admin','doctor'), async (req, res) => {
    try {
        const updatedRecord = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRecord) return res.status(404).json({ message: "Record not found." });
        res.json({ message: "Medical record updated.", updatedRecord });
        blockchain.createBlock({
            userId: req.user.userId,
            action: "UPDATE_MEDICAL_RECORD",
            details: {
              recordId: req.params.id,
              updates: req.body
            }
          });
          
    } catch (error) {
        res.status(500).json({ message: "Error updating medical record.", error });
    }
});

router.put("/patient-data/:id", authorizeRoles("patient"), async (req, res) => {
    try {
        if (req.user.userId !== req.params.id) {
            return res.status(403).json({ message: "You can only update your own data." });
        }

        const updated = await PatientInfo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Patient data updated.", updated });
    } catch (error) {
        res.status(500).json({ message: "Error updating patient data.", error });
    }
});

router.put("/billing-info/:id", authorizeRoles("staff"), async (req, res) => {
    try {
        const updated = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Billing record updated.", updated });
    } catch (error) {
        res.status(500).json({ message: "Error updating billing info.", error });
    }
});

// ======================= DELETE (SOFT) =======================

router.delete("/medical-records/:id", authorizeRoles("admin"), async (req, res) => {
    try {
        const deleted = await MedicalRecord.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        res.json({ message: "Medical record deleted.", deleted });
        blockchain.createBlock({
            userId: req.user.userId,
            action: "DELETE_MEDICAL_RECORD",
            details: {
              recordId: req.params.id
            }
          });          
    } catch (error) {
        res.status(500).json({ message: "Error deleting medical record.", error });
    }
});

router.delete("/patient-data/:id", authorizeRoles("admin"), async (req, res) => {
    try {
        const deleted = await PatientInfo.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        res.json({ message: "Patient data deleted.", deleted });
    } catch (error) {
        res.status(500).json({ message: "Error deleting patient data.", error });
    }
});

router.delete("/lab-tests/:id", authorizeRoles("admin", "staff"), async (req, res) => {
    try {
        const deleted = await LabTest.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        res.json({ message: "Lab test deleted.", deleted });
    } catch (error) {
        res.status(500).json({ message: "Error deleting lab test.", error });
    }
});

router.delete("/users/:id", authenticateUser, authorizeRoles("admin"), async (req, res) => {
    try {
        const deleted = await User.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        res.json({ message: "User deleted.", deleted });
        blockchain.createBlock({
            userId: req.user.userId,
            action: "DELETE_USER",
            details: {
              deletedUserId: req.params.id
            }
          });
          
    } catch (error) {
        res.status(500).json({ message: "Error deleting user.", error });
    }
});

// ======================= ANOMALY =======================

router.get("/anomaly/logins", authenticateUser, authorizeRoles("admin"), async (req, res) => {
    try {
        const logs = await LoginLog.find().sort({ timestamp: -1 }); // Latest first
        res.json(logs);
    } catch (error) {
        console.error("Error fetching login logs:", error);
        res.status(500).json({ message: "Error retrieving login logs." });
    }
});

// NEW: Export login logs to JSON for AI script
router.get('/loginlogs/export', authorizeRoles('admin'), async (req, res) => {
    try {
      const logs = await LoginLog.find({});
      const filePath = path.join(__dirname, '../../ai-ml/data/login_logs.json');
      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
      res.json({ message: 'Logs exported successfully!' });
    } catch (err) {
      console.error('❌ Error exporting login logs:', err);
      res.status(500).json({ message: 'Export failed.' });
    }
  });

router.get("/anomaly/detect", authenticateUser, authorizeRoles("admin"), (req, res) => {
   const scriptPath = path.join(__dirname, "../../ai-ml/run_detector.py");

    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error("Python script error:", error.message);
            return res.status(500).json({ message: "Failed to run anomaly detection.", error: error.message });
        }

        try {
            const anomalies = JSON.parse(stdout); // Parse printed JSON
            res.json(anomalies);
        } catch (parseErr) {
            console.error("Parse error:", parseErr.message);
            res.status(500).json({ message: "Error parsing Python output.", error: parseErr.message });
     }
    });
});

// ======================= BLOCKCHAIN =======================

// Log identity action to blockchain
router.post("/blockchain/log", authenticateUser, async (req, res) => {
    try {
      const { action, details } = req.body;
  
      const block = blockchain.createBlock({
        userId: req.user.userId,
        action,
        details,
      });
  
      res.json({ message: "Blockchain entry created.", block });
    } catch (error) {
      console.error("Blockchain log error:", error);
      res.status(500).json({ message: "Error writing to blockchain." });
    }
  });
  
  // Fetch full ledger (admin only)
  router.get("/blockchain/ledger", authorizeRoles("admin"), (req, res) => {
    try {
      const chain = blockchain.getChain();
      console.log("Current Blockchain:");
      console.log(JSON.stringify(blockchain.getChain(), null, 2));
      res.json(chain);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving blockchain ledger." });
    }
  });

module.exports = router;
