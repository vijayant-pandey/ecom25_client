import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { redis, redisTTL } from "../app.js";



// -------------------------------------------------------------------
// My Order - GET controller block
export const myOrders = TryCatch(async (req, res,next) => {

    const {id:user} = req.query

    const key = `my-orders-${user}`
    let orders
    orders = await redis.get(key);

    if (orders)
        orders = JSON.parse(orders) 
    else{
        orders = await Order.find({user})
        await redis.setex(key, redisTTL, JSON.stringify(orders))
    }

    return res.status(200).json({
        success: true,
        orders,
    })

} )


// -------------------------------------------------------------------
// All Order - GET (ADMIN + USER Both Orders)controller block
// But for this you must pass admin id as query string
export const allOrders = TryCatch(async (req, res,next) => {

    const key = `all-orders`

    let orders
    orders = await redis.get(key)

    if (orders)
        orders = JSON.parse(orders) 
    else{
        // orders = await Order.find().populate("user") - To get all details of the user, but since we only want the name to be displayed so ...... check the below code
        orders = await Order.find().populate("user", "name")
        // console.log("Orders fetched from DB:", orders); // Log raw orders
        await redis.setex(key, redisTTL, JSON.stringify(orders))
    }

    return res.status(200).json({
        success: true,
        orders,
    })
})


// -------------------------------------------------------------------
// All Order - GET controller block
export const getSingleOrder = TryCatch(async (req, res,next) => {

    const {id} = req.params
    const key = `order-${id}`

    let order
    order = await redis.get(key);

    if (order)
        order = JSON.parse(order) 
    else{
        // orders = await Order.find().populate("user") - To get all details of the user, but since we only want the name to be displayed so ...... check the below code
        order = await Order.findById(id).populate("user", "name")

        if (!order)
            return next(new ErrorHandler("Order not found", 404))
            await redis.setex(key, redisTTL, JSON.stringify(order))
    }

    return res.status(200).json({
        success: true,
        order,
    })

} )


// -------------------------------------------------------------------
// Create Order - POST Code Block
export const newOrder = TryCatch(
    async (req: Request<{},{}, NewOrderRequestBody>, res,next) => {

    const {
        shippingInfo, 
        orderItems, 
        user, 
        subtotal, 
        tax, 
        shippingCharges, 
        discount, 
        total
    } = req.body
        
        if (
            !shippingInfo || 
            !orderItems ||
            !user ||
            !subtotal ||
            !tax ||
            // !shippingCharges ||
            // !discount ||
            !total
         )
         return next (new ErrorHandler("Enter All Fields", 400))



    const order = await Order.create({
        shippingInfo, 
        orderItems, 
        user, 
        subtotal, 
        tax, 
        shippingCharges, 
        discount, 
        total
    })

    await reduceStock(orderItems)

    await invalidateCache({
        product: true, 
        order: true, 
        admin: true,
        userId: user,
        productId: order.orderItems.map((i)=>String(i.productId))
    })

    return res.status(201).json({
        success: true,
        message: "Order Place SUccessfully"
    })
})


// -------------------------------------------------------------------
// Update Order - PUT Code Block
export const processOrder = TryCatch(async (req, res,next) => {

    const {id} = req.params

    const order = await Order.findById(id)

    if(!order)
        return next(new ErrorHandler("Order Not Found", 404))
    
    switch(order.status){
        case "Processing": 
            order.status="Shipped"

            break

        case "Shipped":
            order.status="Delivered"

            break

        default:
            order.status="Delivered"
            
            break
    }

    await order.save()

    await invalidateCache({
        product: false, 
        order: true, 
        admin: true,
        userId:order.user,
        orderId:String(order._id),
    })


    return res.status(200).json({
        success: true,
        message: "Order Processed SUccessfully"
    })
})


// -----------------------------------------------------------------
// Delete Order - PUT Code Block
export const deleteOrder = TryCatch(async (req, res,next) => {

    const {id} = req.params

    const order = await Order.findById(id)

    if(!order)
        return next(new ErrorHandler("Order Not Found", 404))
    

    await order.deleteOne()

    await invalidateCache({
        product: false, 
        order: true, 
        admin: true,
        userId:order.user,
        orderId:String(order._id),
    })

    return res.status(200).json({
        success: true,
        message: "Order Deleted Successfully"
    })
})
