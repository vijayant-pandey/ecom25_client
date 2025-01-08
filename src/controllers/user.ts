import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";

// export const newUser = TryCatch(
//     async (
//         req:Request<{}, {}, NewUserRequestBody>, 
//         res:Response, 
//         next:NextFunction
//     ) =>{
//             const {name, email,photo, gender, _id, dob } = req.body

//             let user = await User.findById(_id);

//             if (user) {
//                 return res.status(200).json({
//                     success: true,
//                     message: `Welcome ${user.name}`,
//             });
//         }

//             if(!_id || !name || !email || !photo || !gender || !dob)
//                 return next(new ErrorHandler("All fields are mandatory", 400))
    
//             user = await User.create({
//                 name,
//                 email,
//                 photo,
//                 gender,
//                 _id,
//                 dob:new Date(dob)
//             })
//             return res.status(200).json({
//                 success: true,
//                 message: `Welcome , ${user.name}`
//             })  
//         } 
//     )


    export const newUser = TryCatch(
        async (
            req: Request<{}, {}, NewUserRequestBody>, 
            res: Response, 
            next: NextFunction
        ) => {
            const { name, email, photo, gender, _id, dob } = req.body;

            // Check if user already exists
            let user = await User.findById(_id);
    
            if (user) {
                return res.status(200).json({
                    success: true,
                    message: `Welcome ${user.name}`,
                });
            }
    
            // Validate required fields
            if (!_id) return next(new ErrorHandler("User ID is required", 400));
            if (!name) return next(new ErrorHandler("Name is required", 400));
            if (!email) return next(new ErrorHandler("Email is required", 400));
            if (!photo) return next(new ErrorHandler("Photo URL is required", 400));
            if (!gender) return next(new ErrorHandler("Gender is required", 400));
            if (!dob) return next(new ErrorHandler("Date of Birth is required", 400));
    
            
    
            // Parse and validate DOB
            const parsedDob = new Date(dob);
            if (isNaN(parsedDob.getTime())) {
                return next(new ErrorHandler("Invalid Date of Birth format", 400));
            }
    
            // Create new user
            user = await User.create({
                name,
                email,
                photo,
                gender,
                _id,
                dob: parsedDob,
            });
    
            return res.status(200).json({
                success: true,
                message: `Welcome, ${user.name}`,
            });
        }
    );



export const getAllUsers = TryCatch(async (req, res, next) =>{
    const users = await User.find({})

    return res.status(200).json({
        success: true,
        users,
    })
})


export const getUser = TryCatch(async (req, res, next) =>{
    
    const _id = req.params.id
    const user = await User.findById(_id)


    if (!user) return next(new ErrorHandler(":Invalid Id", 400))
    return res.status(200).json({
        success: true,
        user,
    })
})

export const deleteUser = TryCatch(async (req, res, next) =>{
    
    const id = req.params.id
    const user = await User.findById(id)


    if (!user) return next(new ErrorHandler(":Invalid Id", 400))

    await user.deleteOne()

    return res.status(200).json({
        success: true,
        message:"User Deleted Successfully",
    })
})