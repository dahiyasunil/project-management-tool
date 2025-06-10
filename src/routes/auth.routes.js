import { Router } from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  resendEmailVerification,
  forgotPasswordRequest,
  resetForgottenPassword,
  changeCurrentPassword,
  refreshAccessToken,
} from "../controllers/auth.controllers.js";
import {
  userRegistrationValidator,
  userLoginValidator,
  resendVerificationEmailValidator,
  forgotPasswordRequestValidator,
  resetPasswordValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { isLoggedIn } from "../middlewares/auth.middlewares.js";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);

router.route("/verify/:token").get(verifyEmail);

router.route("/login").post(userLoginValidator(), validate, loginUser);

router.route("/logout").get(logoutUser);

router
  .route("/verify-email")
  .post(resendVerificationEmailValidator(), validate, resendEmailVerification);

router
  .route("/forgot-pwd")
  .post(forgotPasswordRequestValidator(), validate, forgotPasswordRequest);

router
  .route("/reset-pwd")
  .post(resetPasswordValidator(), validate, resetForgottenPassword);

router
  .route("/change-pwd")
  .post(resetPasswordValidator(), validate, isLoggedIn, changeCurrentPassword);

router.route("/refresh").post(isLoggedIn, refreshAccessToken);

export default router;
