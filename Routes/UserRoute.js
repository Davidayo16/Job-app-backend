import express from "express";
import asyncHandler from "express-async-handler";
import User from "./../Models/UserModel.js";
import generateToken from "./../Utils/GenerateToken.js";
import protect from "./../Middleware/AuthMiddleware.js";

const userRoute = express.Router();
// Register Users
userRoute.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    console.log(req.body);
    if (!email || !password || !name) {
      res.status(400);
      throw new Error("please add all fieldss");
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      res.status(400);
      throw new Error("User already exist");
    }
    const user = await User.create({
      email,
      name,
      password,
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      lastname: user.lastName,
      email: user.email,
      location: user.location,
      token: generateToken(user._id),
      createdAt: user.createdAt,
    });
  })
);

// Login Users
userRoute.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!email || !password) {
      throw new Error("Please fill all fields");
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        lastname: user.lastName,
        email: user.email,
        location: user.location,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else {
      res.status(401);
      throw new Error("Invalid credentials");
    }
  })
);

// Get all Users
userRoute.get(
  "/",
  asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  })
);

// Get user details
userRoute.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        lastname: user.lastName,
        email: user.email,
        location: user.location,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

//Update User
userRoute.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const { name, email, location, lastname } = req.body;
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = name ? name : user.name;
      user.email = email ? email : user.email;
      user.location = location ? location : user.location;
      user.lastName = lastname ? lastname : user.lastName;
      const updateUser = await user.save();
      res.json({
        _id: updateUser._id,
        name: updateUser.name,
        lastname: updateUser.lastName,
        email: updateUser.email,
        location: updateUser.location,
        token: generateToken(updateUser._id),
        createdAt: updateUser.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

export default userRoute;
