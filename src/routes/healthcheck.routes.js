import { Router } from "express";
import { healthCheck } from "../controllers/healthchecker.controllers.js";

const router = Router();

router.route("/").get(healthCheck);

export default router;
