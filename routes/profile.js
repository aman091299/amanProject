const express = require("express");
const User = require("../models/user");
const profileRouter = express.Router();
const {userAuth}=require('../middleware/auth')

profileRouter.get("/profile/view",userAuth,async (req, res) => {
  try {
  
    const {emailId}=req.user;
    const userExist = await User.findOne({ emailId });

    if (!userExist) {
      res.status(404).json({
        success: false,
        data:userExist,
        message: "user does not exist ",
      });
    }

    res.status(200).json({
      success: true,
      data:userExist,
      message: "Profile view successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "profile viewing fail" + error,
    });
  }
});

profileRouter.patch('/profile/edit',userAuth,async(req,res)=>{
    try {
        const user=req.user;
    const {name}=req.body;
     if (!name) {
     return  res.status(400).json({success: false,message:"name is required"})
    }
    const userExist=await User.findById(user._id);
     if (!userExist) {
      res.status(404).json({
        success: false,
        message: "user does not exist ",
      });
    }
     userExist.name=name;
     await userExist.save()

        res.status(200).json({
      success: true,
      userExist,
      message: "Profile edit successfully",
    });
    } catch (error) {
            res.status(400).json({
      success: false,
      message: "profile edit fail" + error,
    });
    }
    

})

module.exports = profileRouter;
