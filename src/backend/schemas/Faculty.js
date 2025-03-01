import mongoose from "mongoose";

const FacultySchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: [true, 'Faculty id is required'],
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  courtesy_title: {
    type: String,
    required: [true, 'Courtesy Title is required'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  designation: { // Fixed: Changed duplicate 'title' field to 'designation'
    type: String,
    required: [true, 'Designation is required'],
  },
  additional_role: { // Fixed: Changed duplicate 'title' field to 'designation'
    type: String,
    required: [true, 'Additional role is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  reset: {
    type: Number,
    required: [true, 'Reset is required'],
    unique: true,
  },
});

// Define and export the model
const Faculty = mongoose.model('Faculty', FacultySchema);
export default Faculty;