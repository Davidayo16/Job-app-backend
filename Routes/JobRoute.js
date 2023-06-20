import express from "express";
import asyncHandler from "express-async-handler";
import moment from "moment";
import protect from "../Middleware/AuthMiddleware.js";
import Job from "../Models/JobsModel.js";
import mongoose from "mongoose";

const jobRoute = express.Router();

jobRoute.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { location, company, position, status, type } = req.body;
    try {
      const job = new Job({
        user: req.user._id,
        location,
        company,
        position,
        status,
        type,
      });
      const createdJob = await job.save();
      res.status(200).json(createdJob);
    } catch (error) {
      throw new Error(error);
    }
  })
);

jobRoute.get(
  "/",
  protect,

  asyncHandler(async (req, res) => {
    try {
      const queryObj = { ...req.query };
      console.log(queryObj);
      const excludeFields = ["page", "sort", "limit", "fields", "search"];
      excludeFields.forEach((el) => delete queryObj[el]);

      if (req.query.search) {
        const searchField = req.query.search;
        queryObj.$or = [{ company: { $regex: searchField, $options: "i" } }];
      }
      const userId = req?.user?._id;
      queryObj.user = userId;

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      let query = Job.find(JSON.parse(queryStr));
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
      } else {
        query.sort("-createdAt");
      }
      // Count documents
      const countQueryObj = JSON.parse(queryStr);
      const countQuery = { ...countQueryObj };
      const countDoc = await Job.countDocuments(countQuery);

      // Pagination
      const page = Number(req.query.page) || 1;
      const limit = 12;
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
      if (req.query.page) {
        if (skip >= countDoc) throw new Error("This page does not exist");
      }
      const newJobs = await query;
      res.json({ newJobs, page, pages: Math.ceil(countDoc / limit) });
    } catch (error) {
      throw new Error(error);
    }
  })
);
jobRoute.get(
  "/stats",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const userId = req?.user?._id;
      let stats = await Job.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      stats = stats.reduce((acc, curr) => {
        const { _id: title, count } = curr;
        acc[title] = count;
        return acc;
      }, {});

      const defaultStats = {
        pending: stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0,
      };

      let monthlyApplications = await Job.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 6 },
      ]);

      monthlyApplications = monthlyApplications
        .map((item) => {
          const {
            _id: { year, month },
            count,
          } = item;
          const date = moment()
            .month(month - 1)
            .year(year)
            .format("MMM Y");
          return { date, count };
        })
        .reverse();

      res.json({ defaultStats, monthlyApplications });
    } catch (error) {
      throw new Error(error);
    }
  })
);

jobRoute.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const job = await Job.findById(id);

      res.json(job);
    } catch (error) {
      throw new Error(error);
    }
  })
);

jobRoute.put(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const updatedJob = await Job.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updatedJob);
    } catch (error) {
      throw new Error(error);
    }
  })
);

jobRoute.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const deleteJob = await Job.findByIdAndDelete(id);
      res.json("success");
    } catch (error) {
      throw new Error(error);
    }
  })
);

// ...

export default jobRoute;
