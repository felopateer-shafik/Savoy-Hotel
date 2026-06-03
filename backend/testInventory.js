// testInventory.js
const db = require("./models");
const inventoryService = require("./utils/inventoryService");

async function testInventoryUpdates() {
  try {
    await db.sequelize.authenticate();
    console.log("Connected to database");

    // Get initial inventory status
    const initialInventory = await db.roominventory.findOne({
      where: { roomType: "deluxe" },
    });
    console.log("Initial inventory:", initialInventory.dataValues);

    // Test reserving rooms
    const checkIn = new Date();
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 3);
    console.log(
      `Reserving 2 deluxe rooms from ${checkIn
        .toISOString()
        .slice(0, 10)} to ${checkOut.toISOString().slice(0, 10)}`
    );

    const reserveResult = await inventoryService.reserveRooms(
      "deluxe",
      checkIn,
      checkOut,
      2
    );
    console.log("Reserve result:", reserveResult);

    // Check inventory after reservation
    const afterReserveInventory = await db.roominventory.findOne({
      where: { roomType: "deluxe" },
    });
    console.log(
      "Inventory after reservation:",
      afterReserveInventory.dataValues
    );

    // Test releasing rooms
    console.log("Releasing 2 deluxe rooms");
    const releaseResult = await inventoryService.releaseRooms(
      "deluxe",
      checkIn,
      checkOut,
      2
    );
    console.log("Release result:", releaseResult);

    // Check inventory after release
    const afterReleaseInventory = await db.roominventory.findOne({
      where: { roomType: "deluxe" },
    });
    console.log("Inventory after release:", afterReleaseInventory.dataValues);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.sequelize.close();
  }
}

testInventoryUpdates();
