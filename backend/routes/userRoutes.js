const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.post("/", userController.registerUser);
router.post("/login", userController.loginUser);

// Protected routes (user)
router.get("/profile", protect, userController.getUserProfile);
router.put("/profile", protect, userController.updateUserProfile);

// Protected routes (admin only)
router.get("/", protect, admin, userController.getUsers);
router.get("/:id", protect, admin, userController.getUserById);
router.put("/:id", protect, admin, userController.updateUser);
router.delete("/:id", protect, admin, userController.deleteUser);

module.exports = router;
