import mongoose from "mongoose";

const StudentDocumentSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    unique: true
  },
  templateId: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  data: mongoose.Schema.Types.Mixed,
  files: [{
    fieldName: String,
    filePath: String,
    originalName: String,
    mimeType: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'fa_approved', 'hod_approved', 'rejected', 'completed'],
    default: 'draft'
  },
  facultyAdvisorApproval: {
    approved: { type: Boolean, default: false },
    approvedBy: String,
    approvedAt: Date,
    comments: String
  },
  hodApproval: {
    approved: { type: Boolean, default: false },
    approvedBy: String,
    approvedAt: Date,
    comments: String
  },
  submittedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

StudentDocumentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const StudentDocument = mongoose.model('StudentDocument', StudentDocumentSchema);
export default StudentDocument;