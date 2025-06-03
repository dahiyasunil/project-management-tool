import { Router } from "express";
import { register } from "../controllers/auth.controllers.js";
import { userRegistrationValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middlewares.js";

const router = Router();

router.route("/register").post(userRegistrationValidator(), validate, register);

export default router;
