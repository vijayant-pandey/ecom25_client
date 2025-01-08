import mongoose from "mongoose";


const schema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: [true, "Please Enter Name"],
            trim:true,
        },

        photos:[
            {
            public_id: {
                type: String,
                required: [true, "Please Enter PublicId"],
                trim:true,
            },
            url: {
                type: String,
                required: [true, "Please Enter Photo"],
                trim:true,
            }
        }],

        price:{
            type: Number,
            required: [true, "Please Enter Price"],
            trim:true,
        },

        stock:{
            type: Number,
            required: [true, "Please Enter Name"],
            trim:true,
        },

        category:{
            type: String,
            required: [true, "Please Enter Product Category"],
            trim:true,
        },

        description: {
            type: String,
            required: [true, "Please Enter Description"]
        },

        ratings: {
            type:Number,
            default: 0,
        },

        numOfReviews: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    }

)


export const Product = mongoose.model("Product", schema)



