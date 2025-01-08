import mongoose from "mongoose";
import validator from "validator";
import { Document } from "mongoose";

interface IUser extends Document{
    _id:String;
    name:String;
    email:String;
    photo:String;
    role:"admin" | "user";
    gender: "male" | "female";
    dob: Date;
    createdAt: Date;
    updatedAt: Date;

    // Virtual 
    age: number

}
const schema = new mongoose.Schema(
    {
        _id:{
            type: String,
            required: [true, "Please Enter ID"],
            unique:true,
        },
        name:{
            type: String,
            required: [true, "Please Enter Name"],
            trim:true,
        },
        
        email:{
            type: String,
            unique: [true,"Email Already Exists"],
            required: [true, "Please Enter Email"],
            validate:validator.default.isEmail,
        },
        
        photo:{
            type: String,
            required: [true, "PleaseAdd Photo"],
        },
        
        role:{
            type:String,
            enum:["admin", "user"],
            default:"user",
        },
        
        gender: {
            type: String,
            enum: ["male", "female"],
            required: [true, "Please Enter Gender"],
        },
        
        dob: {
            type: Date,
            enum: [true, "Please Enter DOB"],
            default: new Date("1990-12-02"),
            required: [true, "Please Enter DOB"],
        }, 

    },
    {
        timestamps: true,
    }

)

schema.virtual("age").get(function(){

    if (!this.dob) {
        return null; // Return `null` or a default value if `dob` is not set
    }


    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if (
        today.getMonth() < dob.getMonth() || 
        today.getMonth() === dob.getMonth() && 
        today.getDate() < dob.getDate()
    )
    {
        age -- ;
    }
     

    return age
})



export const User = mongoose.model<IUser>("User", schema)
