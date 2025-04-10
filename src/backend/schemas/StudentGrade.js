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
      session: {type: String,default:''},
      confirmation: { type: Boolean, default: false },
      grade: { type: String, enum: ['O', 'A+', 'A', 'B+', 'B' ,'C' , 'RA','SA','W'], default: null }, // Track the grade for the course
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
      totalCredits: { type: Number }, // Add total credits for semester
      scoredCredits: { type: Number }, // Add scored credits for semester
      marksheetPath: { type: String },
      submissionDate: { type: Date, default: Date.now },
      verified: { type: Boolean, default: false },
      verifiedBy: { type: String },
      verifiedAt: { type: Date },
      rejectedBy: { type: String,default:''},
      rejectedAt: {type: Date, default: Date.now},
      rejectReason: {type: String,default:''}
    }),
    default: {}
  }
});  
const StudentGrades = mongoose.model('StudentGrades', StudentGradesSchema);

export default StudentGrades;
