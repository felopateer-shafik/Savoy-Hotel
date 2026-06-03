// cleanupDuplicates.js
const db = require("../models");

(async () => {
  try {
    // Connect to the database
    await db.sequelize.authenticate();
    console.log("✅ Connected to DB");

    // Find all duplicate combinations of roomType and date
    const duplicates = await db.sequelize.query(
      "SELECT roomType, date, COUNT(*) as count FROM roomavailabilities GROUP BY roomType, date HAVING COUNT(*) > 1",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    console.log(`Found ${duplicates.length} duplicate combinations`);

    if (duplicates.length > 0) {
      console.log("Cleaning up duplicates...");
      let totalRemoved = 0;

      for (const dup of duplicates) {
        // Get all records for this roomType and date
        const records = await db.roomavailability.findAll({
          where: { roomType: dup.roomType, date: dup.date },
          order: [["id", "ASC"]],
        });

        // Keep the first record, delete the rest
        const [keep, ...remove] = records;
        const removeIds = remove.map((r) => r.id);

        console.log(
          `Keeping ID ${keep.id}, removing ${removeIds.length} duplicates for ${dup.roomType} on ${dup.date}`
        );

        // Delete the duplicate records
        const deleted = await db.roomavailability.destroy({
          where: { id: removeIds },
        });

        totalRemoved += deleted;
      }

      console.log(
        `✅ Cleanup complete! Removed ${totalRemoved} duplicate records.`
      );
    } else {
      console.log("✅ No duplicates found.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();
