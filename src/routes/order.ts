import express  from "express";
import { adminOnly } from "../middlewares/auth.js";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from "../controllers/order.js";


const app = express.Router()


// Route = /api/v1/order/new
app.post("/new", newOrder)

// Route = /api/v1/order/my or "/myorders"
app.get("/myorders", myOrders)

// Route = /api/v1/order/all or ?allorders - Only Admin can see all orders
app.get("/allorders", adminOnly, allOrders)

// Route = /api/v1/order/---
app.get("/:id", getSingleOrder)

// Route = /api/v1/order/---
app.put("/:id", adminOnly, processOrder)

// Route = /api/v1/order/---
app.delete("/:id", adminOnly, deleteOrder)


export default app