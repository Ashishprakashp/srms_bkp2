import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema({
    branch: { type: String, required: true },
    regulation: { type: String, required: true },
    batch: { type: String, required: true },
    semester: { type: String, required: true },
    session:{type: String,required:true},
    status:{type:String,required:true,default:"closed"},
    initiated_by:{type:String,required:true},
    initiated_time:{type:Date,default:Date.now}
});

const Enrollment = mongoose.model('Enrollment',EnrollmentSchema);
export default Enrollment;