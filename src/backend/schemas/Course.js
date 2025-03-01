import mongoose from "mongoose";
import semesterSchema from "./semester.js";

const courseSchema = new mongoose.Schema({
  course_name: {
    type: String,
    required: [true, 'Course name is required'],
    unique: true,
  },
  semester_count: {
    type: Number,
    default: 0,
    min: [0, 'Semester count cannot be negative'],
  },
  semesters: [semesterSchema],
  regulations: [
    {
      year: {
        type: String,
        required: [true, 'Year is required'],
      }
    }
  ],
  creation_time: {
    type: Date,
    default: Date.now,
  },
  user_created: {
    type: String,
    required: [true, 'Creator username is required'],
  },
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Course;