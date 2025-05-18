const mongoose=require('mongoose');

const orderSchema=mongoose.Schema({
    name:{
        type:String,
    },
    dateOfCreation:{
    type:Date,
    },
    amount:{

        type:Number,
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
})

const Order=module.exports('Order',orderSchema);

module.exports=Order;