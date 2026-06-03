// initInventory.js
const db = require("../models");
const inventoryService = require("./inventoryService");

// Function to initialize the database with room inventory
const initializeDatabase = async () => {
  try {
    console.log("Initializing room inventory...");

    // Ensure RoomInventory model is ready
    try {
      // Try to access the model to make sure it exists
      const modelCheck = await db.RoomInventory.findAll();
      console.log(
        `Room inventory model is ready. Found ${modelCheck.length} existing records.`
      );
    } catch (modelError) {
      // If there's an error, wait briefly and try again
      console.log("Room inventory model not ready yet, waiting...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await inventoryService.initializeInventory();
    console.log("Room inventory initialization complete");
  } catch (error) {
    console.error("Database initialization error:", error);
    // Despite errors, don't crash the application
    console.log(
      "Continuing server startup despite inventory initialization issues"
    );
  }
};

module.exports = initializeDatabase;
