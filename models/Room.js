const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    tel: {
      type: String,
      required: [true, "Please add an telephone number"],
    },
    openHours: {
      type: String,
      required: [true, "Please add open hours"],
    },
    closeHours: {
      type: String,
      required: [true, "Please add close hours"],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must can not be more than 5"],
    },
    averageRatingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

RoomSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "room",
  justOne: false,
});

module.exports = mongoose.model("Room", RoomSchema);
