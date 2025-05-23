const express=require('express');
const {adminAuth,userAuth}=require('../middleware/auth')
const Category=require('../models/category')
const Product =require('../models/product')

const categoryRouter=express.Router();

categoryRouter.post('/category/create',adminAuth,async(req , res)=>{
try {
         const {name}=req.body;
    if(!name){
    return  res.status(201).json({success: false,message:"name  is required"})

    }
    const slug=(name).trim().replace(/&/g, 'and').replace(/'/g, '').replace(/\s+/g, "-").toLowerCase();
    const category=new Category({
        name,
        slug
    })
    await category.save();
     res.status(200).json({
             success:true,
             messgae:"Category created successfully",
             category
        })

} catch (error) {
     res.status(500).json({
             success:false,
             messgae:"error while creating category"+error
        })
}
})

categoryRouter.get('/category/view/:categoryName',userAuth,async(req,res)=>{
 try {
        const {categoryName}=req.params;
    
        if(!categoryName){
            return res.status(400).json({
                success:false,
                message:"Category Name is required."
            })
          }

        const categorySlug = categoryName.trim().replace(/&/g, 'and').replace(/'/g, '').replace(/\s+/g, "-").toLocaleLowerCase();
     
        const category=await Category.findOne({slug:categorySlug});
        if(!category){
        return  res.status(404).json({
                success:false,
                message:"Category is not found."
            })
        }

     res.status(200).json({
      success: true,
      message: "category founded successfully.",
     category
        })
      }
  catch (error) {
         res.status(500).json({
      success: false,
      message: "Fail to get category: " + error,
    });
 }
})

categoryRouter.get('/category/viewAllCategory',userAuth,async(req,res)=>{
  try {
    const categories=await Category.find({});
     res.status(200).json({
      success: true,
      message: "ALL Category got successfully.",
     categories:categories,
    });
  } catch (error) {
     res.status(500).json({
      success: false,
      message: "Fail to get all categories: " + error,
    });
  }
})

categoryRouter.delete('/category/delete/:categoryName',adminAuth,async(req,res)=>{
    
  try {
        const {categoryName}=req.params;
        if(!categoryName){
          return   res.status(400).json({
                success:false,
                message:"Category Name is required."
            })
        }
                     
        
        
        const CategorySlug = categoryName.trim().replace(/&/g, 'and').replace(/'/g, '').replace(/\s+/g, "-").toLowerCase();

        const category=await Category.findOne({slug:CategorySlug});
     

          if(!category){
      return  res.status(404).json({
                success:false,
                message:"Category is not found."
            })
        }
        await Product.deleteMany({ categoryId: category._id });
        const deleteResult=await Category.findOneAndDelete({slug:CategorySlug});


         res.status(200).json({
      success: true,
      message: "deleted  successfully.",
     deleteResult: deleteResult,
    });
        
  } catch (error) {
       res.status(500).json({
      success: false,
      message: "Fail to delete category: " + error,
    });
  }
})

module.exports=categoryRouter;