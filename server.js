import express from "express";

import dotenv from "dotenv";
import connectDatabase from "./Config/MongoDb.js";

import morgan from "morgan";
import { notFound } from "./Middleware/Error.js";
import { errorHandler } from "./Middleware/Error.js";
import userRoute from "./Routes/UserRoute.js";
import cors from "cors";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import importData from "./DataImport.js";
import jobRoute from "./Routes/JobRoute.js";

dotenv.config();

const app = express();
app.use(cors());

app.use(morgan());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoute);
app.use("/api/import", importData);
app.use("/api/jobs", jobRoute);

// ERROR HANDLER
app.use(notFound);
app.use(errorHandler);

// Catch-all route handler for non-API routes

const PORT = process.env.PORT || 1000;
const start = async () => {
  try {
    await connectDatabase(process.env.MONGO_URL);
    app.listen(PORT, console.log(`server is running on port ${PORT}.......`));
  } catch (error) {
    console.log(error);
  }
};
start();
