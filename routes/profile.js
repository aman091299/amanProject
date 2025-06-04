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

profileRouter.post('/address/create',userAuth,async(req,res)=>{
  try {
    const {label,pinCode,address,landmark}=req.body;
      if (!address) {
     return  res.status(400).json({success: false,message:"Area/address is required"})
    }
      if (!pinCode) {
     return  res.status(400).json({success: false,message:"Pincode is required"})
    }
          if (!landmark) {
     return  res.status(400).json({success: false,message:"Landmark is required"})
    }


 const userExist=await User.findById(req.user._id);

 const duplicateAddress=await userExist.addresses.some(add=>(
   add.street===address.toLowerCase().trim()&&
    add.pinCode===Number(pinCode)&&
    add.landmark===landmark.toLowerCase().trim()
 
));
    if(duplicateAddress){
       return res.status(400).json({
        success: false,
        duplicateAddress:duplicateAddress,
        message: "Address already exist",
      });
      }
  if (!userExist) {
      res.status(404).json({
        success: false,
        message: "user does not exist ",
      });
    }
    //no addresses exist
  
    const isDefault=userExist.addresses.length===0;

    userExist.addresses.push({
      label,landmark,street:address,pinCode,isDefault
    })
   await  userExist.save();
        res.status(200).json({
      success: true,
      userExist,
      message: "User Address successfully Added",
    });
  } catch (error) {
      res.status(400).json({
      success: false,
      message: "Fail to add user address" + error,
    });
  }
 
})

profileRouter.post('/address/update',userAuth,async(req,res)=>{
  try {
    const {isDefault,addressId}=req.body;

    if (!isDefault) {
     return  res.status(400).json({success: false,message:"Default value  is required"})
    }
     if (!addressId) {
     return  res.status(400).json({success: false,message:"Address Id is required"})
    }
     
    const userExist=await User.findById(req.user._id);

  if (!userExist) {
      res.status(404).json({
        success: false,
        message: "user does not exist ",
      });
    }
  
    if(isDefault){
      const updateAddress=userExist.addresses.forEach((add)=>(
        add.isDefault=(add._id.toString()===addressId)
      )
      )
    }
   await  userExist.save();
        res.status(200).json({
      success: true,
      data:userExist,
      message: "User Address successfully update",
    });
  } catch (error) {
      res.status(400).json({
      success: false,
      message: "Fail to update user address" + error,
    });
  }
 
})

profileRouter.get("/address",userAuth,async (req, res) => {
  try {
  
    const userExist = await User.findById( req.user._id);

    if (!userExist) {
      res.status(404).json({
        success: false,
        data:userExist,
        message: "user does not exist ",
      });
    }
    // const address=userExist.addresses.filter(add=> add.isDefault===true);
    // if(address.length===0){
    //   res.status(404).json({
    //     success:false,
    //     message:"Address does not exist",
    //     data:[],
    //   })
    // }
  
    res.status(200).json({
      success: true,
      data:userExist.addresses,
      message: "Address view successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Addresss viewing fail" + error,
    });
  }
});

profileRouter.get("/address/default",userAuth,async (req, res) => {
  try {
    const userExist = await User.findById( req.user._id);

    if (!userExist) {
      res.status(404).json({
        success: false,
        data:userExist,
        message: "user does not exist ",
      });
    }
    const address=userExist.addresses.filter(add=> add.isDefault===true);

    if(address.length===0){
      res.status(404).json({
        success:false,
        message:"Address does not exist",
        data:null,
      })
    }
  
    res.status(200).json({
      success: true,
      data:address[0],
      message: "Default address view successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Default addresss viewing fail" + error,
    });
  }
});

module.exports = profileRouter;
