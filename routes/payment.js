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

      const cart = await Cart.findOne({ userId:user._id }).populate("items.productId");
     
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
            email: user?.emailId,
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
        userId: user._id,
        cartId:cart._id,
        address:address[0],
        notes: {
          firstName: notes.firstName,
          lastName: notes.lastName,
          paymentMethod: notes.paymentMethod,
          address:address,
          cart:cart._id,
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
    console.log("webhookBody",webhookBody ,process.env.WEBHOOK_SECREAT_KEY)
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
    console.log("webhookBody",webhookBody.payload.payment.entity);
    const { order_id, notes, status } = webhookBody.payload.payment.entity;
   
    if (webhookBody.event === "payment.captured") {

      const payment = await Payment.findOneAndUpdate(
      { orderId: order_id },
      { status: status },
      { new: true }
    );
      if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }
      return res.status(200).json({ message: "Payment Verify Successfully" });

    }
     if (webhookBody.event === "payment.failed") {
      console.log("WEBHOOK payment fail");

      return res.status(200).json({ message: "WEBHOOK payment fail" });
    }
  } catch (error) {
     res.status(500).json({
      success: false,
      messsage: "Error in webhook payment api" + error,
    });
  }
    
})

module.exports=paymentRouter;