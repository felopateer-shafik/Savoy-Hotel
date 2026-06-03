// utils/createAdminUser.js
const bcrypt = require("bcryptjs");
const { user } = require("../models");

async function createAdminUser() {
  try {
    const existing = await user.findOne({
      where: { email: "admin@example.com" },
    });
    if (existing) {
      console.log("👤 Admin user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("fofolove123", 10);

    await user.create({
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin user created: admin@example.com / fofolove123");
  } catch (err) {
    console.error("❌ Failed to create admin user:", err);
  }
}

module.exports = { createAdminUser };
