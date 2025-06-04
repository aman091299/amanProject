const Razorpay = require('razorpay')

try{
    var instance = new Razorpay({

        key_id: process.env.RAZORPAY_KEY_ID,
    
        key_secret: process.env.RAZORPAY_KEY_SECRET
    
      });
}
catch(error){
    console.log("Error while creating instance of razorpay"+error)
}




module.exports=instance;