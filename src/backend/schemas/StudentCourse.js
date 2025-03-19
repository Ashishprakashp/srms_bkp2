import mongoose from "mongoose";

const StudentCourseSchema = new mongoose.Schema({
  subject_code: { type: String, required: true, unique: true },
  subject_name: { type: String, required: true },
  subject_type: { type: String, required: true },
  credits: { type: Number, required: true },
   // Semester in which the course is offered
  studentsEnrolled: [
    {
      studentId: { type: String, required: true },
      confirmation: { type: Number, default: 0},
      grade: { type: String, enum: ['O', 'A+', 'A', 'B+', 'B' ,'C' , 'RA/U'], default: null },
      branch: { type: String, required: true },
      regulation: { type: String, required: true },
      batch: { type: String, required: true },
      semester: { type: String, required: true },
    }
  ]
});

const StudentCourse = mongoose.model('Course', courseSchema);
export default StudentCourse;
