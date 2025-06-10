const express=require('express');
const Coupon = require('../models/coupon');
const {adminAuth,userAuth}=require("../middleware/auth")
const Cart=require("../models/cart");
const Payment = require('../models/payment');
const couponRouter=express.Router();
const Category=require("../models/category");

couponRouter.post("/coupon/create",adminAuth,async(req,res)=>{
    try {
         const {
        code,
      discountType,
      discountValue,
      maxDiscount,
      minCartValue,
      applicableCategories,
   
    } = req.body;
  
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    if (!discountType) {
      return res.status(400).json({ success: false, message: "Discount type is required" });
    }
    
    if (!["flat", "percent"].includes(discountType)) {
      return res.status(400).json({ success: false, message: "Discount type must be 'flat' or 'percent'" });
    }
    
    if (discountValue == null) {
      return res.status(400).json({ success: false, message: "Discount value is required" });
    }
       if (maxDiscount == null) {
      return res.status(400).json({ success: false, message: "Max discount is required" });
    }

      if (minCartValue == null) {
      return res.status(400).json({ success: false, message: "Minimum cart value is required" });
    }

    
    if (!Array.isArray(applicableCategories) || applicableCategories.length === 0) {
      return res.status(400).json({ success: false, message: "At least one applicable category is required" });
    }
        //check for valid categories 
        const existingCategories=await Category.find({slug:{$in:applicableCategories}});
            if (existingCategories.length !== applicableCategories.length) {
            return res.status(400).json({
            success: false,
            message: "One or more applicable categories are invalid.",
            });
            }

    const couponExist =await Coupon.findOne({code:code.toUpperCase()});
    if(couponExist){
        res.status(400).json({
            success:false,
            message:"Coupon already exists"
        })
    }
    const coupon=await new Coupon(
        req.body
    )
        
    await coupon.save();
    res.status(200).json({
        success:true,
        message:"Coupon Created Successfully",
        data:coupon
    })
    } catch (error) {
         console.log("Error creating coupon:", error);
         res.status(500).json({
         success: false,
         message: "Error in creating coupon " +error

    });
  }
    
})

couponRouter.post("/coupon/apply",userAuth,async(req,res)=>{
    try {
         const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

       const coupon=await Coupon.findOne({code:code.toUpperCase(),isActive:true});
          if(!coupon){
            return  res.status(404).json({
            success:false,
            message:"Invalid coupon"
        })
          }
          if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
           return res.status(400).json({ success: false, message: "Coupon has expired" });
    }
          const isOldUser=await Payment.findOne({userId:req.user._id});

           if (coupon.isNewUserOnly && isOldUser) {
                  return res.status(400).json({ success: false, message: "Only for new users" });
            }

         const cart = await Cart.findOne({ userId: req.user._id }).sort({ createdAt: -1 })
                                                                                .populate({
                                                                                    path: 'items.productId',
                                                                                    populate: {
                                                                                    path: 'categoryId', // This refers to the field in Product schema
                                                                                    select: 'slug' // Only bring in what you need
                                                                                    }
                                                                                });;
            if(!cart){
               return  res.status(404).json({
            success:false,
            message:"Cart not founded"
        })
            }


               let eligibleAmount = cart.totalPrice;
            //checking for category based discount
          if(Array.isArray(coupon.applicableCategories) && coupon.applicableCategories.length !==0){
            eligibleItems=  cart.items.filter(item=>(
                coupon.applicableCategories.includes(item.productId.categoryId.slug)
            ))
             
              console.log("eligibleItems",eligibleItems)
                if (eligibleItems.length === 0) {
                        return res.status(400).json({
                        success: false,
                        message: "Coupon not applicable to any items in your cart",
                        });
                    }
               eligibleAmount=eligibleItems.reduce((sum,item)=>(
                      sum+item.price*item.quantity
                ),0)

              }

            if (coupon.minCartValue > eligibleAmount) {
            return res.status(400).json({
                success: false,
                message: `Your eligible cart value is below minimum ₹${coupon.minCartValue}`,
            });
            }
               
            let discount=0;
            if(coupon.discountType==='flat'){
                discount=coupon.discountValue;
            }
            else{
                discount=(eligibleAmount*coupon.discountValue)/100;
                if(coupon.maxDiscount  < discount){
                         discount=coupon.maxDiscount;
                }
            }
          cart.totalPrice=cart.originalTotalPrice-discount;
          cart.discount=discount;
          cart.couponId = coupon._id;
           await cart.save();
        
        return res.status(200).json({
        success:true,
        message:"Coupon code applied successfully",
        data:{
            code,
            discount,
            discountValue:coupon.discountValue,
            cart:cart,
            actualTotalPrice: cart.originalTotalPrice,
            totalPrice:cart.totalPrice,
        }
    })
    } catch (error) {
       return  res.status(500).json({
         success: false,
         message: "Error in apply coupon " +error
    })
  }
})

couponRouter.get('/coupon/cart',userAuth,async(req,res)=>{
   try {
      const  cart=await Cart.findOne({userId:req.user._id}).sort({createdAt:-1}).populate('couponId');
      if(!cart){
       return res.status(404).json({
          data:cart,
          success:false,
          message:"Cart not found"
        })
      }
       return res.status(200).json({
          data:cart.couponId.code,
          success:true,
          message:"Coupon fetched successfully"
        })
   } catch (error) {
           return  res.status(500).json({
         success: false,
         message: "Error in apply coupon " +error
    })
   }
})

couponRouter.get("/coupon/remove",userAuth,async(req,res)=>{
    try {
   const cart = await Cart.findOne({ userId: req.user._id }).sort({createdAt:-1});

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }
      cart.totalPrice =cart.originalTotalPrice;
    cart.discount=0;
    cart.couponId=null;
    if(!cart.couponId){
      return res.status(404).json({ success: false, message: "No coupon to remove" });
    }

      await cart.save();

    res.status(200).json({
      success: true,
      message: "Coupon removed successfully",
      cart,
    });
 

    } catch (error) {
             return  res.status(500).json({
         success: false,
         message: "Error in remove coupon " +error
    })
    }
})


couponRouter.get("/coupon/all",async(req,res)=>{
    try {
        
        const coupons=await Coupon.find({isActive:true});
        if(!coupons){
           return res.status(404).json({
                success:false,
                message:"Coupon not founded"
            })
             }
           return  res.status(200).json({
              success:true,
                message:"All Coupons founded successfully",
                data:coupons
            })
       
    } catch (error) {
        console.log("Error getting all coupon:", error);
         res.status(500).json({
         success: false,
         message: "Error in getting all coupon " +error
    })
    }
})
module.exports=couponRouter;