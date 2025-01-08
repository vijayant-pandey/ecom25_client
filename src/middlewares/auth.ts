import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";

// Middleware to make sure that only dmin is allowed to perform specific operation
export const adminOnly = TryCatch (async (req,res,next) =>{

    const {id} = req.query
    if (!id) 
        return next(new ErrorHandler("Login Kar le chutiye", 401))

    console.log("ID passed to User.findById:", id);

    const user = await User.findById(id)
    
    console.log("User found:", user);

    if(!user) 
        
        return next(new ErrorHandler("Saale Fake ID Deta hai", 401))
        
    if(user.role !== "admin") 
        return next(new ErrorHandler("Aukaat me nahi hai teri Admin(Baap) ko bula", 401))

    next()
})

// "/api/v1/user/1?key=24"