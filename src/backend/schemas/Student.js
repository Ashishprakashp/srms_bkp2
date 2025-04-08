import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  // Personal Information
  personalInformation: {
    name: { type: String, default: '' },
    aadhar:{ type: String, default: '' },
    aadharFile: { type: String, default: '' },
    register: { type: String, default: '', unique: true }, // Unique registration number
    student_type: { type: String, enum: ['Day Scholar', 'Hosteller'], default: '' },
    hostel: { type: String, default: '' },
    dob: { type: Date, default: null },
    sex: { type: String, enum: ['M', 'F'], default: '' },
    blood: { type: String, enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], default: '' },
    community: { type: String, enum: ['OC', 'BC', 'MBC', 'SC', 'ST'], default: '' },
    cutoff: { type: Number, min: 0, max: 100, default: null },
    splcategory: { type: String, enum: ['None', 'Ph', 'Sports', 'Ex-Service man', 'NRI', 'Other States', 'Any Other'], default: 'None' },
    scholarship: { type: String, default: '' },
    volunteer: { type: String, enum: ['None', 'NSS', 'NSO', 'YRC'], default: 'None' },
    mobile: { type: String, default: '' },
    mail: { type: String, default: '' },
    fa: { type: String, default: 'None' },
    passportPhoto: { type: String, default: '' }, // File path for passport photo
    branch: { type: String, default: '' }, // Added branch field
    regulation: { type: String, default: '' }, // Added regulation field
    batch: { type: String, default: '' }, // Added batch field
  },

  // Family Information
  familyInformation: {
    fatherName: { type: String, default: '' },
    fatherOcc: { type: String, default: '' },
    fatherInc: { type: Number, default: null },
    motherName: { type: String, default: '' },
    motherOcc: { type: String, default: '' },
    motherInc: { type: Number, default: null },
    parentAddr: { type: String, default: '' },
    parentContact: { type: String, default: '' },
    parentMail: { type: String, default: '' },
    guardianAddr: { type: String, default: '' },
    guardianContact: { type: String, default: '' },
    guardianMail: { type: String, default: '' },
  },

  // Education Details
  education: {
    ug: { type: String, default: '' },
    ugCollege: { type: String, default: '' },
    ugYear: { type: Number, default: null },
    ugPercentage: { type: Number, default: null },
    ugProvisionalCertificate: { type: String, default: '' }, // File path for UG certificate
    xiiBoard: { type: String, default: '' },
    xiiSchool: { type: String, default: '' },
    xiiYear: { type: Number, default: null },
    xiiPercentage: { type: Number, default: null },
    xiiMarksheet: { type: String, default: '' }, // File path for XII marksheet
    xBoard: { type: String, default: '' },
    xSchool: { type: String, default: '' },
    xYear: { type: Number, default: null },
    xPercentage: { type: Number, default: null },
    xMarksheet: { type: String, default: '' }, // File path for X marksheet
  },

  // Entrance and Work Experience
  entranceAndWorkExperience: {
    entrance: { type: String, default: '' },
    entranceRegister: { type: String, default: '' },
    entranceScore: { type: Number, default: null },
    entranceYear: { type: Number, default: null },
    scorecard: { type: String, default: '' }, // File path for entrance scorecard
    workExperience: [{
      employerName: { type: String, default: '' },
      role: { type: String, default: '' },
      expYears: { type: Number, default: null },
      certificate: { type: String, default: '' }, // File path for work experience certificate
    }],
  },

  // Declaration
  acceptance: { type: Boolean, default: false }, // Declaration checkbox
}, { timestamps: true });

const Student = mongoose.model("Student", StudentSchema);

export default Student;