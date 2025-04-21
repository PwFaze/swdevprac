const User = require("../models/User");
const crypto = require("crypto");
const EmailTokens = require("../models/EmailTokens");
const sendEmailConfirmation = require("../utils/sendEmailConfirmation");

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, telephoneNumber, role } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      telephoneNumber,
      role,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

// @desc    Login a user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide an email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res.status(401).json({
      success: false,
      msg: "Cannot convert email or password to string",
    });
  }
};

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

//@desc Log user out / clear cookie
//@route GET /api/v1/auth/logout
//@access Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};
exports.updateUser = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const { email, ...rest } = req.body;
    const emailChanged = req.body.email && req.body.email !== currentUser.email;
    if (!emailChanged) {
      const user = await User.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
        runValidators: true,
      });
      return res.status(200).json({ success: true, data: user });
    }
    const token = crypto.randomBytes(32).toString("hex");
    await EmailTokens.create({
      user: req.user.id,
      email,
      token,
      expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
      pendingUpdate: rest, // store pending non-email updates here
    });
    await sendEmailConfirmation(currentUser.email, token);
    res.status(200).json({
      success: true,
      message: "Please confirm the email change via the email we just sent.",
    });
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};
