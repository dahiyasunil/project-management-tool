import { Router } from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  resendEmailVerification,
} from "../controllers/auth.controllers.js";
import {
  userRegistrationValidator,
  userLoginValidator,
  resendVerificationEmailValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middlewares.js";

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

export default router;
