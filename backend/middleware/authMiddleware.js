const jwt = require("jsonwebtoken");
const db = require("../models");

const unauthorizedResponse = (res, message = "Not authorized") =>
  res.status(401).json({ message });

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorizedResponse(res);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.user.findByPk(decoded.id);
    if (!user) {
      return unauthorizedResponse(res, "User not found");
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return unauthorizedResponse(
      res,
      error.name === "TokenExpiredError" ? "Token expired" : "Invalid token"
    );
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin privileges required" });
};

module.exports = { protect, admin };
