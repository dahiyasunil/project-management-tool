import app from "./app.js";
import dotenv from "dotenv";
import connectDb from "./db/index.js";

dotenv.config("./.env");

const PORT = process.env.PORT || 4000;

connectDb().then(() =>
  app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`))
);
