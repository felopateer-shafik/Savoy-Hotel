//roomInventoryModel.js
module.exports = (sequelize, DataTypes) => {
  const RoomInventory = sequelize.define(
    "roominventory",
    {
      roomType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      totalRooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      availableRooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
    },
    { freezeTableName: true, tableName: "roominventories" }
  );

  return RoomInventory;
};
