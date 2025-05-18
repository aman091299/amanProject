const express=require('express');
const {adminAuth,userAuth}=require('../middleware/auth')
const Category=require('../models/category')

const categoryRouter=express.Router();

categoryRouter.post('/category/create',adminAuth,async(req , res)=>{
try {
         const {name}=req.body;
    if(!name){
    return  res.status(201).json({success: false,message:"name  is required"})

    }
    const category=new Category({
        name
    })
    await category.save();
     res.status(200).json({
             success:true,
             messgae:"Catergory created successfully",
             category
        })

} catch (error) {
     res.status(400).json({
             success:false,
             messgae:"error while creating category"+error
        })
}
})

categoryRouter.get('/category/view/:categoryId',userAuth,async(req,res)=>{
 try {
        const {categoryId}=req.params;
        if(!categoryId){
            res.status(400).json({
                success:false,
                message:"Category Id is required."
            })
        }
        const category=await Category.findById(categoryId);
        if(!category){
       res.status(404).json({
                success:false,
                message:"Category is not found."
            })
        }

     res.status(200).json({
      success: true,
      message: "category founded successfully.",
     category
        })

 } catch (error) {
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

categoryRouter.delete('/category/delete/:categoryId',adminAuth,async(req,res)=>{
    
  try {
        const {categoryId}=req.params;
        if(!categoryId){
            res.status(400).json({
                success:false,
                message:"Category Id is required."
            })
        }
        const category=await Category.findByIdAndDelete(categoryId);
          if(!category){
       res.status(404).json({
                success:false,
                message:"Category is not found."
            })
        }

         res.status(200).json({
      success: true,
      message: "deleted  successfully.",
     category,
    });
        
  } catch (error) {
       res.status(500).json({
      success: false,
      message: "Fail to delelte category: " + error,
    });
  }
})

module.exports=categoryRouter;