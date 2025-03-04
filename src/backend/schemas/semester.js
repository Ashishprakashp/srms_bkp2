import mongoose from "mongoose";

// const semesterSchema = new mongoose.Schema({
//     code: { type: String, required: true }, // Unique identifier for the semester
//     sem_no: { type: Number, required: true }, // Semester number (e.g., 1, 2, 3, etc.)
//     subject_code: { type: String, required: true }, // Code for the subject
//     subject_name: { type: String, required: true }, // Name of the subject
//     credits: { type: Number, required: true }, // Number of credits for the subject
//     subject_type: { type: String, required: true } // Type of subject (e.g., Core, Elective, Lab)
// });

import subjectSchema from "./subject.js";

const semesterSchema = new mongoose.Schema({
  sem_no: { type: Number, required: true }, // Semester number (e.g., 1, 2, 3, etc.)
  subjects: [subjectSchema], // Array of subjects in this semester
});


export default semesterSchema;