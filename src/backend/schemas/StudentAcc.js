import mongoose from "mongoose";

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
    password: {
        type: String,
        required: [true, 'Password is required'],
      },
      reset: {
        type: Number,
        required: [true, 'Reset is required']
      },
  });

  const StudentAcc = mongoose.model('StudentAcc', StudentAccSchema);
  export default StudentAcc;