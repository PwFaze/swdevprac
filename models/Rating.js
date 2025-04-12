const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Rating", RatingSchema);
