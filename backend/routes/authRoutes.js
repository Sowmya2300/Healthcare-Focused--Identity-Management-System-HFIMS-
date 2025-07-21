const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const LoginLog = require('../models/LoginLog');
const router = express.Router();
const fs = require('fs');
const path = require('path');


// JWT Secret Key (Move to .env in production)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Temporary Blacklist for Token Storage
const { addToBlacklist } = require("../middleware/tokenBlacklist");

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (Patients/Guardians self-register, Admin onboards others)
 * @access  Public for Patients/Guardians, Admin-only for Staff
 */
// 🔹 REGISTER API - Patients/Guardians Self-Register, Admin Onboards Staff
router.post("/register", authMiddleware, async (req, res) => {
    try {
        const { username, email, password, role, staffType, age, gender, contactInfo } = req.body;

        // Validate role
        const allowedRoles = ["patient", "guardian", "doctor", "nurse", "researcher", "staff", "admin"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role specified." });
        }

        // Fix: If registering a staff role (doctor, nurse, staff, researcher, admin), REQUIRE Admin authentication
        if (["doctor", "nurse", "researcher", "staff", "admin"].includes(role)) {
            try {
                // Check if Authorization header exists
                if (!req.headers.authorization) {
                    return res.status(403).json({ message: "Admin token required to onboard staff members." });
                }
        
                // Extract token
                const token = req.headers.authorization.split(" ")[1];
                if (!token) {
                    return res.status(403).json({ message: "Invalid token format." });
                }
        
                // Verify Admin Token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (!decoded || decoded.role !== "admin") {
                    return res.status(403).json({ message: "Only Admin can onboard staff members." });
                }
        
            } catch (error) {
                console.error("JWT Verification Error:", error);
                return res.status(401).json({ message: "Invalid or expired token." });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
            staffType: role === "staff" ? staffType : null,
            age: role === "patient" ? age : null,
            gender: role === "patient" ? gender : null,
            contactInfo
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
});


/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        let loginLog = {
            email,
            success: false,
            timestamp: new Date(),
            role: null,
            userId: null
        };

        if (!user) {
            await LoginLog.create(loginLog);
            appendToLoginFile(loginLog);  // << write to JSON file
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            loginLog.userId = user._id;
            loginLog.role = user.role;
            await LoginLog.create(loginLog);
            appendToLoginFile(loginLog);  // << write to JSON file
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Successful login
        loginLog.success = true;
        loginLog.userId = user._id;
        loginLog.role = user.role;
        await LoginLog.create(loginLog);
        appendToLoginFile(loginLog);  // << write to JSON file

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token, user: { id: user._id, role: user.role, email: user.email } });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Error logging in.", error: error.message });
    }
});

// Helper function to append to JSON file
function appendToLoginFile(entry) {
    const filePath = path.join(__dirname, '../../ai-ml/data/login_logs.json');

    try {
        let existing = [];

        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath);
            existing = JSON.parse(content);
        }

        existing.push(entry);
        fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
        console.log("✅ Login log appended to file.");
    } catch (err) {
        console.error("❌ Error writing to login_logs.json:", err.message);
    }
}


/**
 * @route   POST /api/auth/logout
 * @desc    Securely log out users (Blacklist only for privileged users)
 * @access  Private
 */
router.post("/logout", (req, res) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "No token provided. Authorization denied." });
        }

        // Extract token
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(403).json({ message: "Invalid token format." });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }

        // Hybrid Logout: Blacklist for privileged users only
        const privilegedRoles = ["admin", "doctor", "nurse", "staff", "researcher"];
        if (privilegedRoles.includes(decoded.role)) {
            addToBlacklist(token);
            return res.json({ message: "Logged out securely!" });
        } else {
            return res.json({ message: "Logged out from frontend. Token still valid until expiry." });
        }

    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Server error during logout." });
    }
});



module.exports = router;
