require("dotenv").config();

const buildConfig = () => {
  const dialect = process.env.DB_DIALECT || "mysql";
  const sslEnabled =
    String(process.env.DB_SSL || "false").toLowerCase() === "true";
  const dialectOptions = sslEnabled
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {};

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.MYSQL_PUBLIC_URL ||
    process.env.MYSQL_URL ||
    process.env.JAWSDB_URL;

  if (connectionString) {
    // Ensure sequelize-cli can resolve the URL via DATABASE_URL
    process.env.DATABASE_URL = connectionString;
    return {
      use_env_variable: "DATABASE_URL",
      dialect,
      logging: false,
      dialectOptions,
    };
  }

  return {
    username: process.env.MYSQLUSER || process.env.DB_USER || "root",
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || null,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || "savoy_hotel",
    host: process.env.MYSQLHOST || process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
    dialect,
    logging: false,
    dialectOptions,
  };
};

module.exports = {
  development: buildConfig(),
  test: buildConfig(),
  production: buildConfig(),
};
