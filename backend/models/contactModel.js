//contactModel.js
module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define(
    "contact",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "read", "responded"),
        defaultValue: "pending",
      },
    },
    { freezeTableName: true, tableName: "contacts" }
  );

  return Contact;
};
