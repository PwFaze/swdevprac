const express = require("express");
const Rating = require("../models/Rating");
const Room = require("../models/Room");

exports.getRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find();
    res.status(200).json(ratings);
  } catch (error) {
    next(error);
  }
};
exports.getRating = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res
        .status(404)
        .json({ success: false, error: "Rating not found" });
    }
    res.status(200).json(rating);
  } catch (error) {
    next(error);
  }
};

exports.createRating = async (req, res, next) => {
  try {
    const rating = await Rating.create(req.body);
    const room = await Room.findById(req.body.room);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }
    room.averageRatingCount += 1;
    room.averageRating =
      (room.averageRating + req.body.rating) / room.averageRatingCount;
    await room.save();
    res.status(201).json(rating);
  } catch (error) {
    next(error);
  }
};

exports.updateRating = async (req, res, next) => {
  try {
    const rating = await Rating.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rating) {
      return res
        .status(404)
        .json({ success: false, error: "Rating not found" });
    }
    res.status(200).json(rating);
  } catch (error) {
    next(error);
  }
};
exports.deleteRating = async (req, res, next) => {
  try {
    const rating = await Rating.findByIdAndDelete(req.params.id);
    if (!rating) {
      return res
        .status(404)
        .json({ success: false, error: "Rating not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
