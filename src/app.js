import express from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import { ApiError } from "./utils/api-error.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

app.use((err, req, res, next) => {
  console.error(err.message);
  res
    .status(err.statusCode || 500)
    .json(
      new ApiError(
        err.statusCode || 500,
        err.message || "Internal Server Error",
        err.errors || []
      )
    );
});

export default app;
