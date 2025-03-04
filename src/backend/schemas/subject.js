import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  subject_code: { type: String, required: true }, // Code for the subject
  subject_name: { type: String, required: true }, // Name of the subject
  credits: { type: Number, required: true }, // Number of credits for the subject
  subject_type: { type: String, required: true }, // Type of subject (e.g., Core, Elective, Lab)
});

export default subjectSchema;