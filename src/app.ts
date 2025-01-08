import express, { NextFunction, Request, Response } from "express"
import { connectDB, connectRedis } from "./utils/features.js"
import { errorMiddleware } from "./middlewares/error.js"
import {config} from "dotenv"
import morgan from "morgan"
import Stripe from "stripe"
import cors from "cors"
import { v2 as cloudinary } from "cloudinary"




// Importing Routes
import userRoute from "./routes/user.js"
import productRoute from "./routes/products.js"
import orderRoute from "./routes/order.js"
import paymentRoute from "./routes/payment.js"
import dashboardRoute from "./routes/stats.js" 

config({
    path:"./.env"
})
// console.log(process.env.PORT)

const port = process.env.PORT || 4000
const mongoURI = process.env.MONGO_URI || ""
const stripeKey = process.env.STRIPE_KEY || ""
const redisURI = process.env.REDIS_URI || ""
export const redisTTL = process.env.REDIS_TTL || 60 * 60 * 4;

connectDB(mongoURI)

// Redis COnnection
export const redis = connectRedis(redisURI)

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

export const stripe = new Stripe(stripeKey)

const app = express()

app.use(express.json())

app.use(morgan("dev"))

app.use(cors({
    origin: [process.env.CLIENT_URL!],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))



app.get("/", (req,res)=>{
    res.send("API Working with /api/v1")
})

// Using the User Routes
app.use("/api/v1/user", userRoute)

// Product Route
app.use("/api/v1/product", productRoute)


// Order Route
app.use("/api/v1/order", orderRoute)

// Payment Route
app.use("/api/v1/payment", paymentRoute) 

// Statstics Route
app.use("/api/v1/dashboard", dashboardRoute) 

// To view the photo in the beorowser
app.use("/uploads", express.static("uploads"))

app.use(errorMiddleware)

app.listen(port, ()=>{
    console.log(`Express working on : ${port}`)
})