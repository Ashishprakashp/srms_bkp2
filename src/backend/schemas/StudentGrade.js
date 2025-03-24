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
      gradeSubmittedAt: { type: Date, default: null },
      gradeConfirmed: { type: Boolean, default: false },
      gradeConfirmedAt: { type: Date, default: null },
      isReEnrolled: { type: Boolean, default: false }
    }
  ],
  lastUpdated: { type: Date, default: Date.now },

  semesterSubmissions: {
    type: Map,
    of: new mongoose.Schema({
      gpa: { type: Number },
      marksheetPath: { type: String },
      submissionDate: { type: Date, default: Date.now },
      verified: { type: Boolean, default: false },
      verifiedBy: { type: String },
      verifiedAt: { type: Date }
    }),
    default: {}
  }
});  
const StudentGrades = mongoose.model('StudentGrades', StudentGradesSchema);

export default StudentGrades;
