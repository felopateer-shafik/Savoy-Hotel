// createTables.js
const { Sequelize } = require("sequelize");

const createTablesDirectly = async (sequelize) => {
  console.log("Starting direct table creation...");
  try {
    await sequelize.query(`/* SQL from your original createTablesDirectly */`);
    // ... keep all your table creation queries exactly as you wrote them
    console.log("All tables created successfully");
    return true;
  } catch (error) {
    console.error("Error creating tables directly:", error);
    return false;
  }
};

module.exports = { createTablesDirectly };
