import express  from "express";
import { adminOnly } from "../middlewares/auth.js";
import { getBarCharts, getDashboardStats, getLineChart, getPieChart } from "../controllers/stats.js";


const app = express.Router()


// Route = /api/v1/dashboard/stats -- Brings all the stats from db
app.get("/stats", adminOnly, getDashboardStats)

// Route = /api/v1/dashboard/pie
app.get("/pie", adminOnly, getPieChart)

// Route = /api/v1/dashboard/bar
app.get("/bar", adminOnly, getBarCharts)

// Route = /api/v1/dashboard/line
app.get("/line", adminOnly, getLineChart)




export default app