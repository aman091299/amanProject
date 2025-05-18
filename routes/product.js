const { findNonSerializableValue } = require("@reduxjs/toolkit");
const { adminAuth ,userAuth} = require("../middleware/auth");
const Category = require("../models/category");
const Product = require("../models/product");
const express = require("express");

const productRouter = express.Router();

productRouter.post("/product/create", adminAuth, async (req, res) => {
  try {
    const items = req.body;
    const { name, categoryId, tags, price, description, actualPrice, ...rest } =
      items;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name  is required." });
    }
    if (!description) {
      return res
        .status(400)
        .json({ success: false, message: "Description  is required." });
    }
    if (!price) {
      return res
        .status(400)
        .json({ success: false, message: "Price  is required." });
    }
    if (!actualPrice) {
      return res
        .status(400)
        .json({ success: false, message: "Actual Price  is required." });
    }

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "Category ID is requied." });
    }
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }
    const processedTags = tags?.map((tag) => tag.trim());

    const product = new Product({
      tags: processedTags,
      categoryId,
      name,
      price,
      actualPrice,
      description,
      ...rest,
    });
    await product.save();

    category.productIds.push(product._id);
    await category.save();

    res.status(200).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      messgae: "Error while creating product: " + error,
    });
  }
});

productRouter.get("/product/view/:productId",userAuth,async(req,res)=>{
  try {
      const { productId } = req.params;
      if (!productId) {
        return res
          .status(400)
          .json({ success: false, message: "Product ID is required" });
      }
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
     return res
        .status(200)
        .json({ success: true, message: "Product is found .",product:product });
  } catch (error) {
       res.status(500).json({
      success: false,
      messgae: "Error while getting product: " + error,
    });
  }
})

productRouter.patch("/product/update/:productId",adminAuth, async (req, res) => {
    try {
      const {categoryId}=req.body;
        if (categoryId) {
        return res
          .status(400)
          .json({ success: false, message: "CategoryId ID cannot be updated " });
      }

      const { productId } = req.params;
      if (!productId) {
        return res
          .status(400)
          .json({ success: false, message: "Product ID is required" });
      }
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        req.body,
        { new: true }
      );
      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found. ",
        });
      }
      res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        product: updatedProduct,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Fail to update product: " + error,
      });
    }
  }
);

productRouter.delete("/product/delete/:productId",adminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found. ",
      });
    }
    const category = await Category.findById(product.categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found. ",
      });
    }
    const filterProductIds = category.productIds.filter(
      (id) => id.toString() !== productId.toString()
    );
    category.productIds = filterProductIds;
    await category.save();

    const deleteProduct = await Product.findByIdAndDelete(productId);
    if (!deleteProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found. ",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product Deleted successfully.",
      product: deleteProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fail to update product: " + error,
    });
  }
});

productRouter.get('/product/viewAllProducts/:catergoryId',userAuth,async(req,res)=>{
  try {
    
       const filter = {};

       if(req.query.minTime || req.query.maxTime){
          minTime=req.query.minTime||0;
            maxTime=req.query.maxTime||Infinity;
            filter['cookingTime.minTime']={$gte:minTime};
            filter['cookingTime.maxTime']={$lte:maxTime}
       }
   
      if(req.params.catergoryId){
        filter.categoryId=req.params.catergoryId
      }

       if(req.query.boneType){
        filter.boneType=req.query.boneType;
       }
       

   function addFilterArray(fieldName){
          if (req.query[fieldName]) { 
     const values= req.query[fieldName].split(',').map(t=>t.trim());
      filter[fieldName]={$in:values}
    }
     }
   
    addFilterArray('tags')
    addFilterArray('healthBenefits')
    addFilterArray('bestSuitedFor')
    addFilterArray('cutType')

    const products=await Product.find( filter );
     res.status(200).json({
      success: true,
      message: "ALL Product got successfully.",
      products:products,
    });
  } catch (error) {
     res.status(500).json({
      success: false,
      message: "Fail to get all product: " + error,
    });
  }
})


module.exports = productRouter;
