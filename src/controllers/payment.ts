import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";


// Payment COntroller - ANYOne
/* 
export const createPaymentIntent = TryCatch(async (req, res, next) => {

    const { amount } = req.body

    if (!amount )
        return next (new ErrorHandler("Please Enter Amount", 400))

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100, 
        currency: "inr",
    })

        return res.status(201).json({
            success: true,
            clientSecret: paymentIntent.client_secret
        })
}) */


export const createPaymentIntent = TryCatch(async (req, res, next) => {
    const { amount } = req.body;

    console.log("Received payment request with amount:", amount);

    if (!amount) {
        return next(new ErrorHandler("Please Enter Amount", 400));
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(amount) * 100,
            currency: "inr",
        });

        return res.status(201).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.log("Error creating payment intent:");
        return next(new ErrorHandler("Stripe payment creation failed", 500));
    }
});


// -----------------------------------------------------------------------------







//  Create a new Coupon
export const newCoupon = TryCatch(async (req, res, next) => {

    const { code,amount } = req.body

    if (!code || !amount )
        return next (new ErrorHandler("Please Enter both COupon and Amount", 400))
    
    await Coupon.create ({ code, amount })

        return res.status(201).json({
            success: true,
            message: `Coupon ${code} created SUccessfully` 
        })
})

// TO apply a coupon
export const applyDiscount = TryCatch(async (req, res, next) => {

    const { coupon } = req.query

    const discount = await Coupon.findOne({code: coupon})

    if(!discount)
        return next(new ErrorHandler("Invalid Coupon Code ",400 ))

        return res.status(200).json({
            success: true,
            discount: discount.amount,  
        })
})

// FOr Admin to Check all COupons without looking into database via postman
export const allCoupons = TryCatch(async (req, res, next) => {

    const coupons = await Coupon.find({})

        return res.status(200).json({
            success: true,
            coupons, 
        })
})



// To update a coupon - Admin can only do so
export const updateCoupon = TryCatch(async (req, res, next) => {

    const {id} = req.params
    const {code, amount} = req.body
    const coupon = await Coupon.findById(id)

    if (!coupon)
        return next (new ErrorHandler("Invalid Coupon ID", 400))

    if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));
    if (code) coupon.code = code;
    if (amount) coupon.amount = amount;

    await coupon.save();

        return res.status(200).json({
            success: true,
            message: `Coupon ${coupon?.code} Updated Successfully`
        })
})

// To get a coupon -
export const getCoupon = TryCatch(async (req, res, next) => {

    const {id} = req.params

    const coupon = await Coupon.findById(id)

    if (!coupon)
        return next (new ErrorHandler("Invalid Coupon ID", 400))

        return res.status(200).json({
            success: true,
            coupon
        })
})


// To delete a coupon - Admin can only do so
export const deleteCoupons = TryCatch(async (req, res, next) => {

    const {id} = req.params
    const coupons = await Coupon.findByIdAndDelete(id)

    if (!coupons)
        return next (new ErrorHandler("Invalid Coupon ID", 400))

        return res.status(200).json({
            success: true,
            message: `Coupon ${coupons?.code} Deleted Successfully`
        })
})
