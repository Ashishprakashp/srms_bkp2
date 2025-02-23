
import mongoose from "mongoose";

const adminuserSchema = new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true}
});

const adminuser = mongoose.model('adminuser',adminuserSchema);
export default adminuser;