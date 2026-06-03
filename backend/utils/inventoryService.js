// utils/inventoryService.js
const db = require("../models");
const { Sequelize } = require("sequelize");

// Initial room types & counts (used only for first‐time initialization)
const roomTypes = [
  { type: "honeymoon", name: "Honeymoon Suite", count: 20 },
  { type: "family", name: "Family Suite", count: 10 },
  { type: "panoramic", name: "Ocean View Room", count: 25 },
  { type: "exclusive", name: "Luxury Suite", count: 30 },
  { type: "deluxe", name: "Deluxe Single Room", count: 10 },
  { type: "presidential", name: "Presidential Suite", count: 15 },
];

/**
 * Initialize inventory table once.
 */
async function initializeInventory() {
  const existing = await db.roominventory.count();
  if (existing > 0) {
    console.log("Inventory already initialized");
    return;
  }

  for (const { type, name, count } of roomTypes) {
    await db.roominventory.create({
      roomType: type,
      totalRooms: count,
      availableRooms: count,
    });
    console.log(`Initialized ${name} (${type}): ${count} rooms`);
  }
}

/**
 * Helper: get all dates [checkIn, checkOut)
 */
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let curr = new Date(startDate);
  while (curr < endDate) {
    dates.push(curr.toISOString().slice(0, 10));
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return dates;
}

/**
 * Check availability of `roomsNeeded` between two dates.
 */
async function checkAvailability(
  roomType,
  checkIn,
  checkOut,
  roomsNeeded = 1,
  options = {}
) {
  // ensure we have inventory
  const inventory = await db.roominventory.findOne({
    where: { roomType },
    ...options,
  });
  if (!inventory) {
    return { available: false, message: "Room type not found" };
  }

  const dates = getDatesInRange(new Date(checkIn), new Date(checkOut));
  let minAvailable = inventory.availableRooms;

  for (const date of dates) {
    const [avail] = await db.roomavailability.findOrCreate({
      where: { roomType, date },
      defaults: {
        bookedRooms: 0,
        availableRooms: inventory.totalRooms,
      },
      ...options,
    });

    if (avail.availableRooms < roomsNeeded) {
      return {
        available: false,
        message: `Only ${avail.availableRooms} rooms available on ${date}`,
        availableRooms: avail.availableRooms,
      };
    }

    if (avail.availableRooms < minAvailable) {
      minAvailable = avail.availableRooms;
    }
  }

  // all days have ≥ roomsNeeded
  return {
    available: true,
    message: "Rooms available",
    availableRooms: minAvailable,
  };
}

/**
 * Reserve rooms: decrement per‐day availability and update room inventory.
 */
async function reserveRooms(
  roomType,
  checkIn,
  checkOut,
  roomsNeeded = 1,
  options = {}
) {
  const check = await checkAvailability(
    roomType,
    checkIn,
    checkOut,
    roomsNeeded,
    options
  );
  if (!check.available) {
    return { success: false, message: check.message };
  }

  const dates = getDatesInRange(new Date(checkIn), new Date(checkOut));
  for (const date of dates) {
    await db.roomavailability.update(
      {
        bookedRooms: Sequelize.literal(`bookedRooms + ${roomsNeeded}`),
        availableRooms: Sequelize.literal(`availableRooms - ${roomsNeeded}`),
      },
      {
        where: { roomType, date },
        ...options,
      }
    );
  }

  // Update the roominventories table to reflect the booking
  await db.roominventory.update(
    {
      availableRooms: Sequelize.literal(`availableRooms - ${roomsNeeded}`),
    },
    {
      where: { roomType },
      ...options,
    }
  );

  return { success: true };
}

/**
 * Release rooms: increment per‐day availability and update room inventory.
 */
async function releaseRooms(
  roomType,
  checkIn,
  checkOut,
  roomsToRelease = 1,
  options = {}
) {
  const dates = getDatesInRange(new Date(checkIn), new Date(checkOut));
  const inventory = await db.roominventory.findOne({
    where: { roomType },
    ...options,
  });
  const maxRooms = inventory ? inventory.totalRooms : null;

  for (const date of dates) {
    const [avail] = await db.roomavailability.findOrCreate({
      where: { roomType, date },
      defaults: {
        bookedRooms: 0,
        availableRooms: maxRooms || 0,
      },
      ...options,
    });

    await db.roomavailability.update(
      {
        bookedRooms: Sequelize.literal(
          `GREATEST(bookedRooms - ${roomsToRelease}, 0)`
        ),
        availableRooms:
          maxRooms != null
            ? Sequelize.literal(
                `LEAST(availableRooms + ${roomsToRelease}, ${maxRooms})`
              )
            : Sequelize.literal(`availableRooms + ${roomsToRelease}`),
      },
      {
        where: { roomType, date },
        ...options,
      }
    );
  }

  // Update the roominventories table to reflect the release of rooms
  await db.roominventory.update(
    {
      availableRooms:
        maxRooms != null
          ? Sequelize.literal(
              `LEAST(availableRooms + ${roomsToRelease}, ${maxRooms})`
            )
          : Sequelize.literal(`availableRooms + ${roomsToRelease}`),
    },
    {
      where: { roomType },
      ...options,
    }
  );

  return { success: true };
}

/**
 * Fetch current inventory snapshot
 */
async function getInventoryStatus() {
  return db.roominventory.findAll();
}

/**
 * Check availability for every room type in a date range
 * Optimized to fetch all date availability data in a single query
 */
async function getAvailabilityForDateRange(checkIn, checkOut) {
  const inventories = await db.roominventory.findAll();
  const result = {};

  // Get all dates in the range
  const dates = getDatesInRange(new Date(checkIn), new Date(checkOut));

  // Get room types
  const roomTypes = inventories.map((inv) => inv.roomType);

  // Query all room availability data for all room types in the date range at once
  const availabilityData = await db.roomavailability.findAll({
    where: {
      roomType: { [Sequelize.Op.in]: roomTypes },
      date: { [Sequelize.Op.in]: dates },
    },
    raw: true,
  });

  // Create a lookup map for quick access
  const availabilityMap = {};
  availabilityData.forEach((item) => {
    if (!availabilityMap[item.roomType]) {
      availabilityMap[item.roomType] = {};
    }
    availabilityMap[item.roomType][item.date] = item;
  });

  // Process each room type
  for (const inv of inventories) {
    const { roomType, totalRooms } = inv;
    let availableRooms = totalRooms;
    let available = true;
    let message = "Rooms available";

    // Find minimum available rooms across all dates
    for (const date of dates) {
      let dateAvailability = availabilityMap[roomType]?.[date];

      // If we don't have data for this date, create a default entry
      if (!dateAvailability) {
        dateAvailability = {
          availableRooms: totalRooms,
          bookedRooms: 0,
        };

        // Also create this in the database for future queries
        await db.roomavailability.findOrCreate({
          where: { roomType, date },
          defaults: {
            bookedRooms: 0,
            availableRooms: totalRooms,
          },
        });
      }

      // Update the minimum available rooms
      if (dateAvailability.availableRooms < availableRooms) {
        availableRooms = dateAvailability.availableRooms;
      }

      // If any date has 0 availability, the whole range is unavailable
      if (dateAvailability.availableRooms <= 0) {
        available = false;
        message = `No rooms available on ${date}`;
        break;
      }
    }

    // Add to result
    result[roomType] = {
      totalRooms,
      available,
      availableRooms,
      message,
    };
  }

  return result;
}

/**
 * Check availability for every room type for a single date
 * This is a simplified version of getAvailabilityForDateRange for just one day
 */
async function getAvailabilityForDate(date) {
  // Create a date range of just today to tomorrow
  const checkIn = date;
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const checkOut = nextDay.toISOString().split("T")[0];

  // Use the existing function to get availability
  return getAvailabilityForDateRange(checkIn, checkOut);
}

module.exports = {
  initializeInventory,
  checkAvailability,
  reserveRooms,
  releaseRooms,
  getInventoryStatus,
  getAvailabilityForDateRange,
  getAvailabilityForDate,
  roomTypes,
};
