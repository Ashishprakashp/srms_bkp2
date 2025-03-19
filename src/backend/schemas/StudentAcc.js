import mongoose from "mongoose";
import subjectSchema from "./subject.js";

const StudentAccSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, 'StudentId is required'],
        unique: true,
      },
    name: {
        type: String,
        required: [true, 'Name is required']
      },
    branch:{
        type: String,
        required: [true, 'Branch is required']
      },
    regulation:{
        type: String,
        required: [true, 'Regulation is required']
      }, 
      from_year:{
        type: String,
        required: [true, 'Batch is required']
      } ,
      to_year:{
        type: String,
        required: [true, 'Batch is required']
      } ,
      _class:{
        type: String,
        required: [true, 'Class is required']
      } ,
    password: {
        type: String,
        required: [true, 'Password is required'],
      },
      reset: {
        type: Number,
        required: [true, 'Reset is required']
      },
      can_fill:{
        type: Number,
        required: [true, 'can_fill is required']
      },
      filled:{
        type: Number,
        required: [true, 'Filled is required']
      },
      approved:{
        type: Number,
        default: 0,
      },
      refill:{
        type: Number,
        default: 0,
      },
      reason: {
        type: String,
        default:""
      },
      facultyAdvisor: {
        type: String,
        required: [true, 'facultyAdvisor is required']
      },
      arrears:{
        type: [subjectSchema]
      },
      can_enroll:{
        type: Number,
        default:0,
      },
      enrolled:{
        type: Number,
        default:0,
      },
      grades_filled:{
        type: Number,
        default: 0,
      },
      grades_approved:{
        type: Number,
        default: 0,
      },
      grades_reason:{
        type: String,
        default:""
      },
      
  });

  const StudentAcc = mongoose.model('StudentAcc', StudentAccSchema);
  export default StudentAcc;