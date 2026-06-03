// utils/scheduledTasks.js
const cron = require("node-cron");
const { Op } = require("sequelize");
const db = require("../models");
const inventoryService = require("./inventoryService");

/**
 * Release rooms for bookings that have passed checkout
 */
async function releaseExpiredBookings() {
  const today = new Date().toISOString().slice(0, 10);

  // Find all bookings confirmed that have checkOutDate < today
  const expired = await db.Booking.findAll({
    where: {
      checkOutDate: { [Op.lt]: today },
      status: "confirmed",
    },
    include: [
      {
        model: db.Room,
        attributes: ["type"],
        required: true,
      },
    ],
  });

  for (const booking of expired) {
    try {
      // Release rooms for the full stay
      await inventoryService.releaseRooms(
        booking.Room.type,
        booking.checkInDate,
        booking.checkOutDate,
        booking.numberOfRooms
      );

      // Mark booking as completed
      booking.status = "completed";
      await booking.save();
      console.log(`Released & completed booking ${booking.id}`);
    } catch (err) {
      console.error(`Error releasing booking ${booking.id}:`, err);
    }
  }
}

module.exports = {
  /**
   * Start scheduled tasks: run daily at 1:00 AM server time
   */
  start: () => {
    console.log("[scheduledTasks] Starting schedule");
    // Cron expression: minute hour day month weekday
    cron.schedule(
      "0 1 * * *",
      async () => {
        console.log(
          "[scheduledTasks] Running daily release at",
          new Date().toISOString()
        );
        try {
          await releaseExpiredBookings();
          console.log("[scheduledTasks] Daily release completed");
        } catch (err) {
          console.error("[scheduledTasks] Error in daily release:", err);
        }
      },
      {
        scheduled: true,
        timezone: "UTC",
      }
    );
  },
};
