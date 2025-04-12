const Reservation = require("../models/Reservation");
const Room = require("../models/Room");

//@desc Get all rooms
//@route GET /api/v1/rooms
//@access Public
exports.getRooms = async (req, res, next) => {
  try {
    let query;

    const reqQuery = { ...req.query };

    const removeFields = ["select", "sort", "page", "limit"];

    removeFields.forEach((param) => delete reqQuery[param]);

    let queryString = JSON.stringify(reqQuery);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`,
    );
    query = Room.find(JSON.parse(queryString)).populate("reservations");

    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Room.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const rooms = await query;

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: rooms.length,
      pagination,
      data: rooms,
    });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

//@desc Get single room
//@route GET /api/v1/rooms/:id
//@access Public
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

//@desc Create new room
//@route POST /api/v1/rooms
//@access Private
exports.createRoom = async (req, res, next) => {
  const room = await Room.create(req.body);
  res.status(201).json({
    success: true,
    data: room,
  });
};

//@desc Update room
//@route PUT /api/v1/rooms/:id
//@access Private
exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

//@desc Delete room
//@route DELETE /api/v1/rooms/:id
//@access Private
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false });
    }

    await Reservation.deleteMany({ room: req.params.id });
    await Room.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};
