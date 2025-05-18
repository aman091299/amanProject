const mongoose=require('mongoose');


const couponSchema=mongoose.Schema({

    name:{
        type:String,
        required:true,
        uniquie:true,
        trim:true,
    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
    },
    discount:{
        type:Number,
    }
})

const Coupon=mongoose.model("Coupon",couponSchema);

module.exports=Coupon;
