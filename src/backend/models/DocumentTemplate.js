import mongoose from "mongoose";

const DocumentTemplateSchema = new mongoose.Schema({
  templateId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  fields: [{
    fieldName: String,
    fieldLabel: String,
    fieldType: { type: String, enum: ['text', 'number', 'date', 'file', 'select', 'textarea'] },
    required: Boolean,
    options: [String]
  }],
  approvalFlow: {
    facultyAdvisor: { type: Boolean, default: false },
    hod: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

const DocumentTemplate = mongoose.model('DocumentTemplate', DocumentTemplateSchema);
export default DocumentTemplate;