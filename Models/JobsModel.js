import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      require: true,
    },
    company: {
      type: String,
      require: true,
    },
    location: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      require: true,
    },
    type: {
      type: String,
      require: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
