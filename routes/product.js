const { adminAuth, userAuth } = require("../middleware/auth");
const Category = require("../models/category");
const Product = require("../models/product");
const express = require("express");
  const {formattedValue}=require("../utils/formattedVal")

const productRouter = express.Router();

productRouter.post("/product/create/:categoryName", adminAuth, async (req, res) => {
  try {
    const items = req.body;
    const {categoryName}=req.params;
    const { name, tags, price, description, actualPrice,healthBenefits,cuts, ...rest } =items;
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

    if (!categoryName) {
      return res
        .status(400)
        .json({ success: false, message: "Category Name is required." });
    }
  
   const catergorySlug = formattedValue(categoryName);
    
    const category = await Category.findOne({slug: catergorySlug });
  
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }
    const processedTags = formattedValue(tags);
    const formattedNameSlug = formattedValue(name);
    const healthBenefitsFormattedValue=formattedValue(healthBenefits);
    const cutsFormattedValue=formattedValue(cuts);
     
    const product = new Product({
      tags: processedTags,
      categoryId:category._id,
      slug:formattedNameSlug ,
      name,
      price,
      actualPrice,
      description,
      healthBenefits:healthBenefitsFormattedValue,
      cuts:cutsFormattedValue,
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

productRouter.get("/product/view/:productName", async (req, res) => {
  try {
    const { productName} = req.params;
    if (!productName) {
      return res
        .status(400)
        .json({ success: false, message: "Product Name is required" });
    }

    const productSlug = formattedValue(productName);

    const product = await Product.findOne({slug:productSlug}).populate('categoryId');
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    return res
      .status(200)
      .json({ success: true, message: "Product is found .",product: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      messgae: "Error while getting product: " + error,
    });
  }
});

productRouter.patch(
  "/product/update/:productName",
  adminAuth,
  async (req, res) => {
    try {
      const { categoryId,slug ,name,healthBenefits,cuts,tags,...rest} = req.body;
      if (categoryId || slug || name) {
        return res
          .status(400)
          .json({
            success: false,
            message: "CategoryId ID or slug  or name cannot be updated ",
          });
      }

      const { productName } = req.params;
      if (!productName) {
        return res
          .status(400)
          .json({ success: false, message: "Product ID is required" });
      }
     const processedTags =formattedValue(tags); 
    const healthBenefitsFormattedValue=formattedValue(healthBenefits);
    const cutsFormattedValue=formattedValue(cuts);
      const formattedSlug = formattedValue(productName);
      const updatedProduct = await Product.findOneAndUpdate(
        {slug:formattedSlug,
         },
          {tags:processedTags,
          healthBenefits:healthBenefitsFormattedValue
          ,cuts:cutsFormattedValue,
        ...rest},
        { new: true }
      ).populate('categoryId');
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

productRouter.delete(
  "/product/delete/:productId",
  adminAuth,
  async (req, res) => {
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
  }
);

productRouter.delete("/product/deleteAllProducts",adminAuth,async(req,res)=>{

  try {

      const categories=await Category.find({});
      if(categories.length===0){
         return  res.status(404).json({
        success: false,
        message: "fisrtly create the category for the products",
      });
      }
      console.log(categories)
         categories.forEach(async(category)=>{
            category.productIds=[];
             await category.save();
         })

       

       const deleteResult=await Product.deleteMany({});
          res.status(200).json({
        success: true,
        message: "All Product Deleted successfully.",
        count: deleteResult.deletedCount,
        Result: deleteResult,
      });
  } catch (error) {
     res.status(500).json({
        success: false,
        message: "Fail to delete all product: " + error,
      });
  }



})

productRouter.get(
  "/product/viewAllProducts/:categoryName",
  async (req, res) => {
    try {
      const filter = {};

      //  if(req.query.minTime || req.query.maxTime){
      //     minTime=req.query.minTime||0;
      //       maxTime=req.query.maxTime||Infinity;
      //       filter['cookingTime.minTime']={$gte:minTime};
      //       filter['cookingTime.maxTime']={$lte:maxTime}
      //  }

      if (req.params.categoryName) {

        const formattedCategorySlug = formattedValue(req.params.categoryName);
        
        const catergory = await Category.findOne({
          slug: formattedCategorySlug 
        });
        if(!catergory){
         return res.status(404).json({
        success:false,
        message: "Category not found ",
               });
        }
        filter.categoryId = catergory._id;
      }

      if (req.query.boneType) {
        filter.boneType = req.query.boneType;
      }

      function addFilterArray(fieldName) {
        if (req.query[fieldName]) {
          let values = req.query[fieldName];
        
          if (typeof values === "string") {
            values = values.split(",").map((t) => t.trim());
          } else {
            values = values.map((t) => t.trim());
          }

          filter[fieldName] = { $in: values };
    
        }
      }

      addFilterArray("tags");
      addFilterArray("healthBenefits");
      addFilterArray("bestSuitedFor");
      addFilterArray("cuts");

      const products = await Product.find(filter).populate({path:'categoryId',populate:{
                                                            path:'productIds',
                                                            model:'Product'
      }});
      if(!products){
          return  res.status(404).json({
        success: true,
        message: "Product not found.",
        products: products,
      });
      }
       
      res.status(200).json({
        success: true,
        message: "ALL Product got successfully.",
        count:products.length,
        products: products
       
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Fail to get all product: " + error,
      });
    }
  }
);

productRouter.get("/product/allProductDetails",userAuth,async(req,res)=>{

    try {
      const products = await Product.find({}).populate({path:'categoryId',
                                                        populate:{
                                                          path:'productIds',
                                                           model: 'Product',
                                                        }});
        if(!products){
          return  res.status(404).json({
        success: true,
        message: "Product not found.",
        products: products,
      });
      }
        res.status(200).json({
        success: true,
        message: "ALL Product got successfully.",
         count:products.length,
        products: products
       
      });
    } catch (error) {
       return res.status(500).json({
        success: false,
        message: "Fail to get all product: " + error,
      });
      
    }
})
module.exports = productRouter;
