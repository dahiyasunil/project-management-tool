import crypto from "crypto";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  sendMail,
  emailVerificationContentTemplate,
  forgotPasswordContentTemplate,
} from "../utils/mail.js";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullname } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json(new ApiError(409, "User already exists"));
  }

  const user = await User.create({ email, username, password, fullname });

  if (!user) {
    throw new Error("Failed to register user.");
  }

  const { hashedToken, unHashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save();

  sendMail({
    email: email,
    subject: "Verify your email",
    mailContentType: emailVerificationContentTemplate(
      fullname,
      process.env.BASE_URL + `/api/v1/auth/verify/${unHashedToken}`
    ),
  });

  res
    .status(201)
    .json(new ApiResponse(201, {}, "User registered successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res
      .status(400)
      .json(new ApiError(400, "Invalid verification token"));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({ emailVerificationToken: hashedToken });

  if (!user) {
    return res
      .status(400)
      .json(new ApiError(400, "Invalid verification token"));
  }

  if (user.isEmailVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User is already verified"));
  }

  if (Date.now() > user.emailVerificationExpiry) {
    const { hashedToken, unHashedToken, tokenExpiry } =
      user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    sendMail({
      email: user.email,
      subject: "Verify your email",
      mailContentType: emailVerificationContentTemplate(
        user.fullname,
        process.env.BASE_URL + `/api/v1/auth/verify/${unHashedToken}`
      ),
    });

    return res
      .status(401)
      .json(new ApiError(401, "Verification token expired"));
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(new ApiError(404, "Invalid email or password"));
  }

  const validPassword = await user.isPasswordCorrect(password);

  if (!validPassword) {
    return res.status(404).json(new ApiError(404, "Invalid email or password"));
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.refreshAccessToken();

  user.refreshToken = refreshToken;

  await user.save();

  const cookieOptions = {
    secure: true,
    httpOnly: true,
  };

  res
    .cookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

  res
    .status(200)
    .json(new ApiResponse(200, { id: user._id }, "login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("access_token", {}, { expires: new Date(0) });

  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(new ApiError(404, "User does not exists"));
  }

  const { hashedToken, unHashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save();

  const mailOptions = {
    email,
    subject: "Verify your email",
    mailContentType: emailVerificationContentTemplate(
      user.fullname,
      process.env.BASE_URL + `/api/v1/auth/verify/${unHashedToken}`
    ),
  };

  await sendMail(mailOptions);

  res.status(200).json(new ApiResponse(200, {}, "Resent verification email"));
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(new ApiError(404, "User does not exists"));
  }

  const { hashedToken, unHashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save();

  const mailOptions = {
    email,
    subject: "Reset Password",
    mailContentType: forgotPasswordContentTemplate(
      user.fullname,
      process.env.BASE_URL + `/api/v1/auth/reset-pwd/${unHashedToken}`
    ),
  };

  await sendMail(mailOptions);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Reset password link sent to user"));
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!token) {
    return res
      .status(400)
      .json(new ApiError(400, "Invalid verification token"));
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json(new ApiError(400, "Password do not match"));
  }

  const hashedToken = crypto.createHash("256").update(token).digest("hex");

  const user = await User.findOne({ emailVerificationToken: hashedToken });

  if (!user) {
    return res.status(404).json(new ApiError(404, "User does not exists"));
  }

  if (Date.now() > user.forgotPasswordExpiry) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
    return res.status(400).json(new ApiError(400, "Invalid token"));
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const { _id } = req.user;

  if (newPassword !== confirmPassword) {
    return res.status(400).json(new ApiError(400, "Password do not match"));
  }

  const user = await User.findById(_id);

  if (!user) {
    return res.status(404).json(new ApiError(404, "User does not exists"));
  }

  user.password = newPassword;

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

export {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  resendEmailVerification,
  forgotPasswordRequest,
  resetForgottenPassword,
  changeCurrentPassword,
};
