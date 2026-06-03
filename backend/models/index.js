// models/index.js
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

// Prefer Railway's standard MySQL env vars when available
// Prefer Railway-provided env vars if present
const {
  MYSQL_PUBLIC_URL,
  MYSQLHOST,
  MYSQLPORT,
  MYSQLUSER,
  MYSQLPASSWORD,
  MYSQLDATABASE,
  DATABASE_URL,
} = process.env;

let sequelize;
// 1) Prefer Railway's public proxy URL for local development
if (MYSQL_PUBLIC_URL) {
  sequelize = new Sequelize(MYSQL_PUBLIC_URL, {
    dialect: "mysql",
    logging: false,
  });
} else if (DATABASE_URL) {
  // e.g. mysql://user:pass@host:port/db
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "mysql",
    logging: false,
  });
} else {
  const database = MYSQLDATABASE || process.env.DB_NAME || "savoy_hotel";
  const username = MYSQLUSER || process.env.DB_USER || "root";
  const password = MYSQLPASSWORD || process.env.DB_PASSWORD || "";
  const host = MYSQLHOST || process.env.DB_HOST || "localhost";
  const port = Number(MYSQLPORT || process.env.DB_PORT || 3306);

  sequelize = new Sequelize(database, username, password, {
    host,
    port,
    dialect: "mysql",
    logging: false,
  });
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// load models
db.User = require("./userModel")(sequelize, Sequelize.DataTypes);
db.Room = require("./roomModel")(sequelize, Sequelize.DataTypes);
db.Booking = require("./bookingModel")(sequelize, Sequelize.DataTypes);
db.Review = require("./reviewModel")(sequelize, Sequelize.DataTypes);
db.Contact = require("./contactModel")(sequelize, Sequelize.DataTypes);
db.RoomInventory = require("./roomInventoryModel")(
  sequelize,
  Sequelize.DataTypes,
);
db.RoomAvailability = require("./roomAvailabilityModel")(
  sequelize,
  Sequelize.DataTypes,
);

// alias lowercase keys so your controllers don't break
db.user = db.User;
db.room = db.Room;
db.booking = db.Booking;
db.review = db.Review;
db.contact = db.Contact;
db.roominventory = db.RoomInventory;
db.roomavailability = db.RoomAvailability;

// define relations
db.User.hasMany(db.Booking, {
  foreignKey: "userId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
db.Booking.belongsTo(db.User, {
  foreignKey: "userId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

db.Room.hasMany(db.Booking, {
  foreignKey: "roomId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
db.Booking.belongsTo(db.Room, {
  foreignKey: "roomId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

db.User.hasMany(db.Review, { foreignKey: "userId", onDelete: "CASCADE" });
db.Review.belongsTo(db.User, { foreignKey: "userId", onDelete: "CASCADE" });

db.Room.hasMany(db.Review, { foreignKey: "roomId", onDelete: "CASCADE" });
db.Review.belongsTo(db.Room, { foreignKey: "roomId", onDelete: "CASCADE" });

module.exports = db;
