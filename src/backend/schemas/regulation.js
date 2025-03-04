import mongoose from "mongoose";
import semesterSchema from "./semester.js";

const regulationSchema = new mongoose.Schema({
  year: { type: String, required: true }, // Regulation year (e.g., "2023")
  semester_count: {
    type: Number,
    default: 0,
    min: [0, "Semester count cannot be negative"],
  }, // Number of semesters in this regulation
  semesters: [semesterSchema], // Array of semesters for this regulation
});

export default regulationSchema;