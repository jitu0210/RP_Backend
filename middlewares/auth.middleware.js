// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

/**
 * verifyToken: validates the Authorization header (Bearer token)
 * attaches decoded payload to req.user
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Missing Authorization header" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ message: "Invalid Authorization format" });

    const token = parts[1];
    const secret = process.env.JWT_SECRET;
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid or expired token" });
      req.user = decoded; // decoded contains sub, username, role
      return next();
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * restrictTo: returns middleware that checks roles
 * usage: restrictTo('admin')
 */
export const restrictTo = (...allowedRoles) => (req, res, next) => {
  const role = req.user && req.user.role;
  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({ message: "Forbidden: insufficient permissions" });
  }
  return next();
};
