import express  from "express";

import { adminOnly } from "../middlewares/auth.js";
import { allReviewsOfProduct, deleteProduct, deleteReview, getAdminProducts, getAllCategories, getLatestProducts, getSingleProduct, newProduct, newReview, searchAllProducts, updateProduct } from "../controllers/product.js";
import { multiUpload } from "../middlewares/multer.js";


const app = express.Router()

// Create New Product - api/vi/product/new
app.post("/new", adminOnly,  multiUpload, newProduct)

// Get Search Product with filters - api/vi/product/search
app.get("/search", searchAllProducts)

// Get Latest Product - api/vi/product/latest
app.get("/latest", getLatestProducts)

// Create Categories - api/vi/product/categories
app.get("/categories", getAllCategories)

// Create New Product - api/vi/product/admin-products
app.get("/admin-products", getAdminProducts)

// Route - Get Single Product
app.get("/:id", getSingleProduct)

// Route - To Update the product
app.put("/:id", adminOnly, multiUpload, updateProduct)

// Route - To Delete the product
app.delete("/:id",adminOnly, deleteProduct)

// Reviews
app.get("/reviews/:id", allReviewsOfProduct);
app.post("/review/new/:id", newReview);
app.delete("/review/:id", deleteReview);

// Chaining syntax for the above two codes
// app.route(":id").get(getSingleProduct).delete(adminOnly, deleteUser)
export default app