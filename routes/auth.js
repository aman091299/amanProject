const User=require('../models/user');
const express=require('express');
const authRouter=express.Router();
const bcrypt=require('bcrypt');

authRouter.post('/signup',async(req,res)=>{
   try{
     
 const {emailId,name,password,role}=req.body;

        if (!emailId) {
     return  res.status(400).json({success: false,message:"Emailid is required"})
    }
    if (!password) {
     return res.status(400).json({success: false,message:"Password is required"});
    }
    
   const userExist=await User.findOne({emailId});
   if(userExist){
    return  res.status(404).json({
         success:false ,
         message:"User Already exist please login"
      })
   }
   const hashPassword=await bcrypt.hash(password,10)
   const user=new User({
         emailId,name,password:hashPassword,role
   })

   //generate token
   const token =user.generateAuthToken();
   res.cookie('token',token,{
   expires: new Date(Date.now() + 86400000), 
    // "path" - The cookie is accessible for APIs under the '/api' route
   //  path: '/api', 
    // "domain" - The cookie belongs to the 'example.com' domain
   //  domain: 'example.com', 
    // "secure" - The cookie will be sent over HTTPS only
    secure: true, 
    // "HttpOnly" - The cookie cannot be accessed by client-side scripts
    httpOnly: true
   })
      await user.save();
   res.status(200).json({
      success:true,
      message:'user is successfull register'
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
      res.status(404).json({
         success:false,
         message:" Please signup "
      })
    }

    const hashPassword=(userExist.password);

    const comparePassword=await bcrypt.compare(password,hashPassword);
    
    if(!comparePassword){
    return  res.status(404).json({
         success:false,
         message:"Invalid credentials"
      })
    }
    const token=await userExist.generateAuthToken();

    res.cookie('token',token,{
        expires: new Date(Date.now() + 86400000), 
    // "path" - The cookie is accessible for APIs under the '/api' route
   //  path: '/api', 
    // "domain" - The cookie belongs to the 'example.com' domain
   //  domain: 'example.com', 
    // "secure" - The cookie will be sent over HTTPS only
    secure: true, 
    // "HttpOnly" - The cookie cannot be accessed by client-side scripts
    httpOnly: true
    })
    userExist.password=undefined;
    res.status(200).json({
      success:true,
      message:"successfully login",
         userExist
    })
  } catch (error) {
      res.status(500).json({
      success:false,
      message:"login fail" +error
    })
  }
   

     
})

authRouter.post('/logout',async(req,res)=>{
   res.clearCookie("token");
   return  res.status(200).json({
  success: true,
    message: "User logout sucessfully",
  });
})

module.exports=authRouter;