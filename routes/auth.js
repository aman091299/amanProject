const User=require('../models/user');
const express=require('express');
const authRouter=express.Router();
const bcrypt=require('bcrypt');

authRouter.post('/signup',async(req,res)=>{
   try{
     
    console.log("inside login")
 const {emailId,password,firstName,}=req.body;

     if (!emailId) {
     return res.status(400).json({success: false,message:"Password is required"});
    }
    if (!password) {
     return res.status(400).json({success: false,message:"Password is required"});
    }
      if (!firstName) {
     return  res.status(400).json({success: false,message:"firstName is required"})
    }
  
   const userExist=await User.findOne({emailId});
   if(userExist){
    return  res.status(404).json({
         success:false ,
         message:"User Already exist please login"
      })
   }
  
   const user=new User({
         emailId,firstName,password
   })
 
      await user.save();
      user.password=undefined;
   res.status(200).json({
      success:true,
       data:user,
      message:'user is successfully register'
   })
   }
   catch(err){
   res.status(500).json({
      success:false,
     
      message:'user registeration fail' + err,
   })
   }
  
   
})

authRouter.post('/login',async(req,res)=>{
  try {
     const {emailId,password}=req.body;
    
        if (!emailId) {
     return  res.status(400).json({success: false,message:"Emailid is required"})
    }
    if (!password) {
     return res.status(400).json({success: false,message:"Password is required"});
    }
    
    const userExist=await User.findOne({emailId});
    if(!userExist){
     return res.status(404).json({
         success:false,
         message:" Please signup "
      })
    }


    const comparePassword=await userExist.password===password;
    
    if(!comparePassword){
    return  res.status(404).json({
         success:false,
         message:"Invalid credentials"
      })
    }
   
    userExist.password=undefined;
    res.status(200).json({
      success:true,
      message:"successfully login",
         data:userExist
    })
  } catch (error) {
      res.status(500).json({
      success:false,
      message:"login fail" +error
    })
  }
   

     
})



module.exports=authRouter;