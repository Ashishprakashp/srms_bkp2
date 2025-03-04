import mongoose from "mongoose";
import regulationSchema from "./regulation.js";

const courseSchema = new mongoose.Schema({
  course_name: {
    type: String,
    required: [true, "Course name is required"],
    unique: true,
  },
  regulations: [regulationSchema], // Array of regulations
  creation_time: {
    type: Date,
    default: Date.now,
  },
  user_created: {
    type: String,
    required: [true, "Creator username is required"],
  },
});

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
export default Course;