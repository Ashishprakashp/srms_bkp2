import mongoose from 'mongoose';

const StudentGradesSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  branch: { type: String, required: true }, // Branch of the student
  regulation: { type: String, required: true },
  batch: { type: String, required: true },
  enrolledCourses: [
    {
      courseCode: { type: String, required: true },
      semester: { type: String, required: true },
      confirmation: { type: Boolean, default: false },
      grade: { type: String, enum: ['O', 'A+', 'A', 'B+', 'B' ,'C' , 'RA/U'], default: null }, // Track the grade for the course
      isReEnrolled: { type: Boolean, default: false }, // Flag to check if a student is re-enrolled
    }
  ]
});  
const StudentGrades = mongoose.model('StudentGrades', StudentGradesSchema);

export default StudentGrades;
