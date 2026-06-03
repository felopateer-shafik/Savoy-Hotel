// listTables.js
const db = require("./models");

(async () => {
  try {
    // 1) connect
    await db.sequelize.authenticate();
    console.log("✅ Connected to DB");

    // 2) list all tables
    const [tables] = await db.sequelize.query("SHOW TABLES");
    console.log("\n📋 Tables in this database:");
    console.table(tables);

    // 3) show all users
    const users = await db.user.findAll();
    console.log("\n👥 Users table contents:");
    console.table(users.map((u) => u.toJSON()));

    process.exit(0);
  } catch (err) {
    console.error("❌ Error listing tables/users:", err);
    process.exit(1);
  }
})();
