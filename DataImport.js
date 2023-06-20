import asynHandler from "express-async-handler";
import express from "express";
import User from "./Models/UserModel.js";
import users from "./Data/user.js";

const importData = express.Router();

importData.post(
  "/user",
  asynHandler(async (req, res) => {
    await User.deleteMany({});
    const importUsers = await User.insertMany(users);
    res.send({ importUsers });
  })
);

export default importData;
