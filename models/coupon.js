const mongoose=require('mongoose');


const couponSchema=mongoose.Schema({

    code:{
        type:String,
        required:true,
        uniquie:true,
        trim:true,
        uppercase:true,
    },
    discountType:{
        type:String,
         enum:["flat","percent"],
         required:true,
    },
    discountValue:{
        type:Number,
        required:true,
    },
    maxDiscount:{
        type:Number,
        required:true,
    }, 
    minCartValue: {
    type: Number,
    required:true,
  },
  isNewUserOnly:{
    type:Boolean,
    default:false,
  },
  applicableCategories:{
    type:[String],
    default:[],
     trim:true,
  },
    isActive: {
    type: Boolean,
    default: true,
  },
    expiresAt: {
    type: Date,
  },
    tag: {
       type:String,
        required:true,
        uniquie:true,
        trim:true,
        uppercase:true,// e.g., "MOST LOVED", "INSTANT FAVOURITE"
  },
    description: {
    type: String,
     trim:true,
  },
  tagColor:{
    type:String,
     trim:true,
  }
})

const Coupon=mongoose.model("Coupon",couponSchema);

module.exports=Coupon;
