import express  from "express";
import { adminOnly } from "../middlewares/auth.js";
import { allCoupons, applyDiscount, createPaymentIntent, deleteCoupons, getCoupon, newCoupon, updateCoupon } from "../controllers/payment.js";


const app = express.Router()

// Route = /api/v1/payment/create
app.post("/create", createPaymentIntent)

// Route = /api/v1/payment/discount
app.get("/discount", applyDiscount)

// ----------------------ADMIN----------------------------------
// Route = /api/v1/payment/coupon/new -- Create Coupon
app.post("/coupon/new", adminOnly,  newCoupon)

// Route = /api/v1/payment/coupon/all - For admin to check all coupons without looking into database
app.get("/coupon/all", adminOnly, allCoupons)

// Route = /api/v1/payment/coupon/:id - To Get a coupon admin
app.get("/coupon/:id", adminOnly,  getCoupon)

// Route = /api/v1/payment/coupon/:id - To delete a coupon
app.delete("/coupon/:id", adminOnly,  deleteCoupons)

// Route = /api/v1/payment/coupon/:id - To delete a coupon
app.put("/coupon/:id", adminOnly, updateCoupon)

// Route = /api/v1/payment/coupon/:id - To delete a coupon
app.delete("/coupon/:id", adminOnly,  deleteCoupons)


// Chaining syntax for the above two codes
// app.route(":id").get(getUser).delete(adminOnly, deleteUser)


export default app