const express=require('express');
const { userAuth } = require('../middleware/auth');
const instance=require("../utils/razorpay");
const Payment=require("../models/payment");
const Cart =require("../models/cart");
const User=require("../models/user")
var {validatePaymentVerification,validateWebhookSignature} = require("razorpay/dist/utils/razorpay-utils");
const paymentRouter=express.Router();


paymentRouter.post("/payment/create/order",userAuth,async(req,res)=>{
    try {
         const {type}=req.body;
             if(!type){
          return  res.status(404).json({
              success: false,
              message: "type is required ",
            });
         }

      const user=req.user;
        const userExist = await User.findById( req.user._id);
      
          if (!userExist) {
          return  res.status(404).json({
              success: false,
              data:userExist,
              message: "user does not exist ",
            });
          }
          const address=userExist.addresses.filter(add=> add.isDefault===true);

           if(address.length===0){
       return   res.status(404).json({
        success:false,
        message:"Address does not exist",
        data:null,
      })
    }

      const cart = await Cart.findOne({ userId:user._id }).populate("items.productId").sort({ createdAt: -1 });
     
        if (!cart) {
          return res.status(200).json({
            data: [],
            success: true,
            message: "Cart does not exist ",
          });
        }

        
    var options = {
            amount:cart.totalPrice*100,  // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            currency: "INR",
            receipt: "order_rcptid_11",
            notes: {
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    user_id: user._id,
                    emailId:user?.emailId,
                    paymentMethod: type,

                },
              };

    instance.orders.create(options, async function (err, order) {

      if (err) {
        return res.status(400).json({
          messages: "Error in creating order" + err,
          success: false,
        });
    }

   const { id, currency, notes, status } = order;
    const createPayment = new Payment({
        orderId: id,
        amount: cart.totalPrice,
        currency: currency,
        status: status,
        paymentMode:type,
         paymentStatus:'Pending',
        userId: user._id,
        cartId:cart._id,
        address:address[0],
        notes: {
          firstName: notes.firstName,
          lastName: notes.lastName,
          paymentMethod: notes.paymentMethod,
          address:address,
          cart:cart._id,
          emailId:user?.emailId
        },
      });
      await createPayment.save();
      return res.status(200).json({
        message: "Order created succssfully",
        success: true,
        data: createPayment,
        key: process.env.RAZORPAY_KEY_ID,
      });
         })
    } catch (error) {
            res.status(500).json({
      success: false,
      messsage: "Error in order creating api" + error,
    });
    }
     
})

paymentRouter.post("/payment/webhook",async(req,res)=>{
  try {
    console.log("inside webhook");
    const webhookBody = req.body;
    const webhookSignature = req.headers["x-razorpay-signature"];
    
     const isWebhookValid = validateWebhookSignature(
      JSON.stringify(webhookBody),
      webhookSignature,
      process.env.WEBHOOK_SECREAT_KEY
    );
     if (!isWebhookValid) {
      console.log("WEBHOOK Invalid");
      return res.status(400).json({ message: "Invalid webhook Signature" });
    }
    const { order_id, notes, status } = webhookBody.payload.payment.entity;
   
    if (webhookBody.event === "payment.captured") {

      const payment = await Payment.findOneAndUpdate(
      { orderId: order_id },
      { status: status ,paymentStatus:"Paid"},
      { new: true }
    );
      if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }
      // creat an empty cart of this user and do the thing in here in cart and donot delete the previous cart this may lost the history of payment model cartId
        const cart = await Cart.findOneAndUpdate({ userId: notes.user_id },{ status: 'ordered' }).sort({ createdAt: -1 });
     
        if (!cart) {
          return res.status(200).json({
            data: [],
            success: true,
            message: "Cart does not exist ",
          });
        }
          const newEmptyCart = new Cart({
          userId: notes.user_id,
          items: [],
          totalPrice: 0,
        });

        await newEmptyCart.save();
      return res.status(200).json({ message: "Payment Verify Successfully and new Cart is created Successfully" });

    }
     if (webhookBody.event === "payment.failed") {
      console.log("WEBHOOK payment fail");
      const payment = await Payment.findOneAndUpdate(
      { orderId: order_id },
      { status: status},
      { new: true }
    );
     if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }
      return res.status(200).json({ message: "WEBHOOK payment fail" });
    }
  } catch (error) {
     res.status(500).json({
      success: false,
      messsage: "Error in webhook payment api" + error,
    });
  }
    
})

paymentRouter.get("/payment/verify",userAuth,async(req,res)=>{

  try{
     const payment=await Payment.findOne({userId:req.user._id}).sort({createdAt:-1}).lean();
     if(!payment){
         res.status(400).json({
      success:false,
      messsage: "Payment not found" ,
      data:payment
    });
    }
    if(payment.paymentStatus==="Paid"){
    res.status(200).json({
      success: true,
      messsage: "Payment Verification Successfully" ,
      data:payment
    });
    }
    else{
    res.status(404).json({
      success: false,
      messsage: "Payment Verificatin Fail" ,
      data:payment
    });
    }
     
   
  }
  catch(error){
  res.status(500).json({
      success: false,
      messsage: "Error in payment verification api" + error,
    });
  }
})

paymentRouter.post("/payment/cod",userAuth,async(req,res)=>{
  try {
        const user=req.user;
         const {type}=req.body;
         if(!type){
          return  res.status(404).json({
              success: false,
              message: "type is required ",
            });
         }
        const userExist = await User.findById( req.user._id);
      
          if (!userExist) {
          return  res.status(404).json({
              success: false,
              data:userExist,
              message: "user does not exist ",
            });
          }
          const address=userExist.addresses.filter(add=> add.isDefault===true);

           if(address.length===0){
       return   res.status(404).json({
        success:false,
        message:"Address does not exist",
        data:null,
      })
    }
    
      const cart = await Cart.findOne({ userId:user._id }).populate("items.productId").sort({ createdAt: -1 });
     
        if (!cart) {
          return res.status(200).json({
            data: [],
            success: true,
            message: "Cart does not exist ",
          });
        }
    const createPayment = new Payment({
        orderId: "COD_"+Date.now(),
        amount: cart.totalPrice,
          currency: "INR",
        status:'created',
        paymentMode:type,
         paymentStatus:'Pending',
        userId: user._id,
        cartId:cart._id,
        address:address[0],
        notes: {
          firstName: user.firstName,
          lastName: user.lastName,
          paymentMethod: user.paymentMethod,
          address:address,
          cart:cart._id,
          emailId:user?.emailId
        },
      });
      await createPayment.save();
        // Mark cart as ordered
      cart.status = "ordered";
      await cart.save();

     const newEmptyCart = new Cart({
          userId: user._id,
          items: [],
          totalPrice: 0,
        });

        await newEmptyCart.save();
        return  res.status(200).json({
              success: true,
              data:createPayment,
              message: "COD order placed successfully ",
            });
  } catch (error) {
      res.status(500).json({
      success: false,
      messsage: "Error in payment verification api" + error,
    });
  }
})

paymentRouter.get("/payment/order/summary",userAuth,async(req,res)=>{
  try {

    req.user.password=undefined;
    const payment=await Payment.findOne({userId:req.user._id}).sort({createdAt:-1});
    if(!payment){
      return  res.status(404).json({
      success:false,
      message:"Payment not found",
      data:null
    })
    
    }
    
    const  cart=await Cart.findById(payment.cartId).populate("items.productId");
       if(!cart){
     return   res.status(404).json({
      success:false,
      message:"Cart not found",
      data:null
    })
    
    }
      const formattedCart = cart?.items?.map((item) => ({
          name: item.productId.name,
          price: item.productId.price,
          itemQuantity: item.quantity,
          _id: item.productId._id,
          combo: item.productId.combo,
          actualPrice: item.productId.actualPrice,
          deliveryDate:cart.deliveryDate,
          deliverySlot:cart.deliverySlot
        }));
     return res.status(200).json({
      success:true,
      message:"Cart details founded successfully",
      data:{cartData:formattedCart,userDetails:req.user,
        paymentStatus:payment.paymentStatus,
        amount:payment.amount,
        paymentMode:payment.paymentMode,
        OrderDate:payment.createdAt,

      },
    })
    
  } catch (error) {
      console.error("Error in /payment/order/summary:", error);
   return res.status(500).json({
      success:false,
      message:"Error in order summary "+ error,
    })
  }
})

module.exports=paymentRouter;