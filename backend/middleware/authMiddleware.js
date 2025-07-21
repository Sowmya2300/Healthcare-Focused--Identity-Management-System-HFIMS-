const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const { isBlacklisted } = require("./tokenBlacklist");

/**
 * Middleware to verify JWT and check if it's blacklisted
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided. Authorization denied." });
    }

    // ✅ Extract only the token (removes "Bearer ")
    const token = authHeader.split(" ")[1];

    // 🔥 Check if token is blacklisted
    if (isBlacklisted(token)) {
        return res.status(403).json({ message: "Token is blacklisted. Please log in again." });
    }    

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        console.error("Token Error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
