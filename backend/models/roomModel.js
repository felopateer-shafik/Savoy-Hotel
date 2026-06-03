// backend/models/roomModel.js
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    "Room",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      mainImage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      images: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("images")
            ? JSON.parse(this.getDataValue("images"))
            : [];
        },
        set(val) {
          this.setDataValue("images", JSON.stringify(val));
        },
      },
      type: {
        type: DataTypes.ENUM(
          "exclusive",
          "family",
          "deluxe",
          "panoramic",
          "presidential",
          "honeymoon"
        ),
        allowNull: false,
      },
      adultCapacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      childrenCapacity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      features: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("features")
            ? JSON.parse(this.getDataValue("features"))
            : [];
        },
        set(val) {
          this.setDataValue("features", JSON.stringify(val));
        },
      },
      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
      },
      numReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      availability: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      beds: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // --- REMOVE any totalRooms or availableRooms fields here! ---
    },
    {
      tableName: "rooms",
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Room;
};
