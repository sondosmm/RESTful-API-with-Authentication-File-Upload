const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const { generateTokens } = require("../utils/generateTokens");
const asyncHandler = require("../utils/asyncHandler");
const bcrypt = require("bcryptjs");
// const { token } = require('morgan');
const nodemailer = require("nodemailer");
const ApiError = require("../utils/apiError");
require("dotenv").config({ path: "./config.env" });

const jwt = require("jsonwebtoken");

exports.register = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError("email and password are required", 400));
    }

    const user = await User.create({ email, password });
    
    res.status(201).json({ id: user._id });
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // <-- allows self-signed certs
      },
    });

     transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "welcome to our website",
        text: "you are registered successfully",
        html: "<h1>Welcome!</h1><p>Thank you for registering.</p>",
      }).then(() => {
        console.log("Email sent successfully");
      }).catch((error) => {
        console.error("Error sending email:", error);
      });


    console.log("user created successfully");
   
  } catch (err) {
    console.error("Error during registration:", err);
    const code = err.code || (err.cause && err.cause.code);
    if (code === 11000) {
      return next(new ApiError("email already exists", 409));
    }
    return next(new ApiError("registration failed", 500));
  }
});

exports.login = asyncHandler(async (req, res, next) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return next ( new ApiError("email and password are required", 400) );
  }
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
   return next ( new ApiError("incorrect email or password", 401) );
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  await Token.findOneAndUpdate(
    { userId: user._id },
    { token: refreshToken },
    { upsert: true }
  );

  res.cookie("accessToken", accessToken, { httpOnly: true });
  res.cookie("refreshToken", refreshToken, { httpOnly: true });

  res.json({ accessToken });

  
 
});

exports.refresh = asyncHandler(async (req, res,next) => {
  const { refreshToken } = req.cookies;
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const tokenExist = await Token.findOne({ token: refreshToken });
  if (!tokenExist) {
    return next(new ApiError("Invalid refresh token", 401));
  }
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    decoded.id
  );
  await Token.findOneAndUpdate(
    { token: refreshToken },
    { token: newRefreshToken }
  );

  res.cookie("accessToken", accessToken, { httpOnly: true });
  res.cookie("refreshToken", newRefreshToken, { httpOnly: true });

  res.json({ accessToken });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  await Token.findOneAndDelete({ token: refreshToken });
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");


  res.status(200).json({ message: "user logged out successfully" });
});
