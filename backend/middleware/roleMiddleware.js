const jwt = require("jsonwebtoken");
const { isBlacklisted } = require("./tokenBlacklist");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * Middleware to authenticate and authorize users based on roles.
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
                return res.status(401).json({ message: "No token provided. Authorization denied." });
            }

            const token = req.headers.authorization.split(" ")[1];

            if (isBlacklisted(token)) {
                return res.status(403).json({ message: "Token is blacklisted. Please log in again." });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;

            // 🔥 Check if user role is allowed
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ message: "Access denied: You do not have permission." });
            }

            next(); // Allow request to proceed
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
    };
};

module.exports = authorizeRoles;
