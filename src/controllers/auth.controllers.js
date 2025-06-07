import crypto from "crypto";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { sendMail, emailVerificationContentTemplate } from "../utils/mail.js";

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
      `http://localhost:3000/api/v1/auth/verify/${unHashedToken}`
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

  if (Date.now() > user.emailVerificationExpiry) {
    const { hashedToken, unHashedToken, tokenExpiry } =
      user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    sendMail({
      email: email,
      subject: "Verify your email",
      mailContentType: emailVerificationContentTemplate(
        fullname,
        `http://localhost:3000/api/v1/auth/verify/${unHashedToken}`
      ),
    });

    return res
      .status(401)
      .json(new ApiError(401, "Verification token expired"));
  }

  user.emailVerificationToken = undefined;
  user.isEmailVerified = true;

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully."));
});

export { registerUser, verifyEmail, loginUser, logoutUser };
