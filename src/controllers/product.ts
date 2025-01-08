import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
// import { rm } from "fs";
// import {faker} from "@faker-js/faker"
// import {ProductDocument} from "../types/types.js"
import { redis, redisTTL } from "../app.js";
import { deleteFromCloudinary, findAverageRatings, invalidateCache, uploadToCloudinary } from "../utils/features.js";
import { User } from "../models/user.js";
import { Review } from "../models/review.js";
// -------------------------------------------------------------------

// Revalidate on New, Update, or Delete Products &/or New Order 
export const getLatestProducts = TryCatch (async (req,res, next) => {

        let products
        products = await redis.get("latest-products");

        if (products)
            products = JSON.parse(products)
        else{

        // Sort the latest products on the basis of created at and will display only 5 i.e. limit 
        products = await Product.find({}).sort({createdAt: -1}).limit(5)
        await redis.setex("latest-products", redisTTL, JSON.stringify(products));
        }


        return res.status(201).json({
            success:true,
            products,
    })
})

// -------------------------------------------------------------------
// Revalidate on New, Update, or Delete Products &/or New Order
export const getAllCategories = TryCatch( async ( req, res, next ) => {

        let categories
        categories = await redis.get("categories");

        if (categories)
            categories = JSON.parse(categories)
        else{
            categories = await Product.distinct("category")
            await redis.setex("categories", redisTTL, JSON.stringify(categories));
        }


        return res.status(200).json({
            success:true,
            categories,
    })
})

// -------------------------------------------------------------------
// Revalidate on New, Update, or Delete Products &/or New Order
export const getAdminProducts = TryCatch( async ( req,res, next) => {
        
        let products
        products = await redis.get("all-products");

        if (products)
            products = JSON.parse(products)

        else{
            products = await Product.find({})
            await redis.setex("all-products", redisTTL, JSON.stringify(products));
        }

        // Sort the latest products on the basis of created at and will display only 5 i.e. limit 
        return res.status(201).json({
            success:true,
            products,
    })
})

// -------------------------------------------------------------------
// Get Details of the SIngle Product by passing the :id
export const getSingleProduct = TryCatch( async ( req,res, next ) => {

        const id = req.params.id
        const key = `product-${id}`;

        let product
        product = await redis.get(key);

        if (product) 
            product = JSON.parse(product)
        
        else {
            product = await Product.findById(id)
            
            if (!product)
                return next(new ErrorHandler("Product Not Found", 404))
            
            await redis.setex(key, redisTTL, JSON.stringify(product));
            }
        
        return res.status(201).json({
            success:true,
            product,
    })
})


// -------------------------------------------------------------------
// Code-block for to Create New Product -POST
export const newProduct = TryCatch(async (
        req:Request<{},{}, NewProductRequestBody >, 
        res, 
        next
    ) => {

        console.log(req.body); // Inspect the form fields
        console.log(req.files); // Inspect the uploaded files

        const  {name, price, stock, category, description} = req.body
        const photos = req.files as Express.Multer.File[] | undefined

    if(!photos) 
        return next (new ErrorHandler("Please add Photo", 400))

    if (photos.length < 1)
        return next (new ErrorHandler("Please add atleast 1 photo", 400))

    if (photos.length > 5)
        return next (new ErrorHandler("Please add only 5 photo", 400))


    if (!name || !price || !stock || !category || !description)
        return next (new ErrorHandler("Please Add All Fields", 400))

    // Upload Here
    const photosURL = await uploadToCloudinary(photos)

await Product.create({
    name, 
    price, 
    description,
    stock, 
    category:category.toLowerCase(), 
    photos:photosURL,
})

await invalidateCache({product:true, admin: true,})
    return res.status(201).json({
        success:true,
        message: "Product Created Successfully"
    })
})


// -------------------------------------------------------------------
// To Update the details of the Product
export const updateProduct = TryCatch( async ( req, res, next) => {

        const {id} = req.params
        const {name, price, stock, category, description} = req.body
        const photos = req.files as Express.Multer.File[] | undefined
        
        // Fetch the product to be updated
        const product = await Product.findById(id)
        if (!product)
            return next (new ErrorHandler("Product Not Found", 404))

        // Handle the photos if new ones are provided
        if(photos && photos.length > 0) 
            {
                // Upload new photos to Cloudinary
                const photosURL = await uploadToCloudinary(photos)

                // Delete old images from Cloudinary
                const ids = product.photos.map((photo) => photo.public_id); // Get public IDs of old images
                await deleteFromCloudinary(ids); // Delete old photos from Cloudinary

                // Clear the existing photo array using Mongoose's splice
                // product.photos = photosURL
                product.photos.splice(0, product.photos.length); 

                // Add the newly uploaded photos to the product's photo array
                photosURL.forEach((photo) =>
                    product.photos.push(photo) // Use push for DocumentArray
                )
            }

            if (name) product.name = name;
            if (price) product.price = price
            if (stock) product.stock = stock
            if (category) product.category = category
            if (description) product.description = description

            await product.save()

            await invalidateCache({
                product:true, 
                productId: String(product._id), 
                admin: true,
            })

            return res.status(200).json({
                success:true,
                message: "Product Updated Successfully"
            })
})


// -------------------------------------------------------------------
// To Delete a Product
export const deleteProduct = TryCatch(
    async (
        req,res, next
    ) => {

        const product = await Product.findById(req.params.id)

        if (!product)
        {
            return next (new ErrorHandler("Product Not Found", 404))
        }

        const ids = product.photos.map((photo) => photo.public_id)

        await deleteFromCloudinary(ids)

         // Delete the specific product using its unique ID
        await Product.deleteOne({ _id: product._id });

        await invalidateCache({
            product:true, 
            productId: String(product._id), 
            admin: true,})
        
        return res.status(201).json({
            success:true,
            message:"Product Deleted SUccessfully"
    })
})


// -------------------------------------------------------------------
// For searching Products - getAllProducts by 6pack programmer
export const searchAllProducts = TryCatch(
    async (
        req:Request<{}, {}, {}, SearchRequestQuery>,
        res:Response,
        next:NextFunction
    ) => {

        const {search, sort, category, price} = req.query

        const page = Number(req.query.page) || 1

        const key = `products-${search}-${sort}-${category}-${price}-${page}`;

        let products;
        let totalPage
        
        const cachedData = products = await redis.get(key)

        if (cachedData){

            const data = JSON.parse(cachedData)
            totalPage = data.totalPage
            products = data.products
        }
        else{
            const limit = Number(process.env.PRODUCT_PER_PAGE) || 8
            const skip = (page - 1) * limit
            const baseQuery: BaseQuery = {}
            
            if (search)
                baseQuery.name = {
                $regex:search, 
                $options:"i"
                }

            if (price)
                baseQuery.price = {
                    $lte:Number(price), 
                }

            if (category)
                baseQuery.category=category
            
            const productsPromise = Product.find(baseQuery)
                .sort( sort && {price:sort === "asc" ? 1 : -1})
                .limit(limit)
                .skip(skip)

            const [productsFetched, filteredOnlyProduct] = await Promise.all([
                productsPromise, 
                Product.find(baseQuery)
            ])

            products = productsFetched
            
            totalPage = Math.ceil(filteredOnlyProduct.length / limit)
                
                await redis.setex(key, 30, JSON.stringify({products, totalPage}))
            }

    return res.status(201).json({
        success:true,
        products,
        totalPage,
    })
})


// -------------------------------------------------------------------
// See All The Reviews of The Product
export const allReviewsOfProduct = TryCatch(async (req, res, next) => {
    let reviews;
    const key = `reviews-${req.params.id}`;
  
    reviews = await redis.get(key);
  
    if (reviews) reviews = JSON.parse(reviews);
    else {
      reviews = await Review.find({
        product: req.params.id,
      })
        .populate("user", "name photo")
        .sort({ updatedAt: -1 });
  
        await redis.setex(key, redisTTL, JSON.stringify(reviews));
    }
  
    return res.status(200).json({
      success: true,
      reviews,
    });
  });



// -------------------------------------------------------------------
// Make a Review of theProduct
export const newReview = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.query.id);

  if (!user) return next(new ErrorHandler("Not Logged In", 404));

  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const { comment, rating } = req.body;

  const alreadyReviewed = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  if (alreadyReviewed) {
    alreadyReviewed.comment = comment;
    alreadyReviewed.rating = rating;

    await alreadyReviewed.save();
  } else {
    await Review.create({
      comment,
      rating,
      user: user._id,
      product: product._id,
    });
  }



//   Ratings and reviews
const { ratings, numOfReviews } = await findAverageRatings(product._id);

product.ratings = ratings;
product.numOfReviews = numOfReviews;

await product.save();

await invalidateCache({
  product: true,
  productId: String(product._id),
  admin: true,
  review: true,
});

return res.status(alreadyReviewed ? 200 : 201).json({
  success: true,
  message: alreadyReviewed ? "Review Update" : "Review Added",
});
});

//   Delete Review
export const deleteReview = TryCatch(async (req, res, next) => {
    const user = await User.findById(req.query.id);
  
    if (!user) return next(new ErrorHandler("Not Logged In", 404));
  
    const review = await Review.findById(req.params.id);
    if (!review) return next(new ErrorHandler("Review Not Found", 404));
  
    const isAuthenticUser = review.user.toString() === user._id.toString();
  
    if (!isAuthenticUser) return next(new ErrorHandler("Not Authorized", 401));
  
    await review.deleteOne();
  
    const product = await Product.findById(review.product);
  
    if (!product) return next(new ErrorHandler("Product Not Found", 404));
  
    const { ratings, numOfReviews } = await findAverageRatings(product._id);
  
    product.ratings = ratings;
    product.numOfReviews = numOfReviews;
  
    await product.save();
  
    await invalidateCache({
      product: true,
      productId: String(product._id),
      admin: true,
    });
  
    return res.status(200).json({
      success: true,
      message: "Review Deleted",
    });
  });


// -------------------------------------------------------------------
// To Generate Fake Products its DOne 
// export const generateRandomProducts = async (count: number = 10) => {
//     const products: ProductDocument[] = []; // Explicitly typed array

//     for (let i = 0; i < count; i++) {
//         const product: ProductDocument = {
//             name: faker.commerce.productName(),
//             photo: "uploads\\b11ad915-6a57-4b00-a909-54fa472e5384.jpg", // Placeholder image path
//             price: Number(faker.commerce.price({ min: 1500, max: 80000, dec: 0 })),
//             stock: Number(faker.commerce.price({ min: 0, max: 100, dec: 0 })),
//             category: faker.commerce.department().toLowerCase(),
//             createdAt: new Date(faker.date.past()),
//             updatedAt: new Date(faker.date.recent()),
//             __v: 0,
//         };

//         products.push(product);
//     }

//     // Insert into the database
//     await Product.insertMany(products);

//     console.log({ success: true, message: `${products.length} products generated` });
// };

// // Call the function to generate 40 random products
// generateRandomProducts(40);


// Deleting the Fake Products Generated
// const deleteRandomProducts = async (count: number = 10) => {
//     const products = await Product.find({}).skip(2)

//     for (let i = 0; i < products.length; i++){
//         const product = products[i]
//         await product.deleteOne()
//     }

//     console.log({success: true})
// }

// deleteRandomProducts(38)