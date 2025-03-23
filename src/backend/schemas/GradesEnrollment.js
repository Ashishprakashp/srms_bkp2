import mongoose from "mongoose";

const GradesEnrollmentSchema = new mongoose.Schema({
    branch: { type: String, required: true },
    regulation: { type: String, required: true },
    batch: { type: String, required: true },
    semester: { type: String, required: true },
    session:{type: String,required:true},
    status:{type:String,required:true,default:"closed"},
    initiated_by:{type:String,required:true},
    initiated_time:{type:Date,default:Date.now}
});

const GradesEnrollment = mongoose.model('GradesEnrollment',GradesEnrollmentSchema);
export default GradesEnrollment;