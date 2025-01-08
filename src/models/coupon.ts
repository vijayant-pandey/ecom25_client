import mongoose, { Schema } from "mongoose";


const schema = new mongoose.Schema({
    code:{
        type:String,
        required: [true, "Please enter Coupon COde"],
        unique: true,        
    },
    amount :{
        type: Number,
        required: [true, "Please enter Discount Amont"],
    },
})
export const Coupon = mongoose.model("Coupon", schema)
