const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required:true,
        },
        quantity: {
          type: Number,
          required:true,
        },
        price:{
          type:Number,
          required:true,
        }
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalPrice:{
      type:Number,
      default:0,
    },
  status: {
  type: String,
  enum: ['active', 'ordered'],
  default: 'active'

    } ,  
   deliveryDate: {
    type: String, // '07-06-2025'
  
  },
  deliverySlot: {
    type: String, // '6:00 - 8:00 pm'

  },
  couponId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Coupon',
    default:null,
  },
  discount:{
    type:Number,
    default:0,
  },
   originalTotalPrice:{
    type:Number,
    default:0,
  },
  },
  { timestamps: true }
);


cartSchema.methods.calculateTotalPrice=function(){
 
       this.items.reduce((acc,item)=>{
             console.log("item quantity",item.quantity,"item price",item.price);
        },0)
       return this.items.reduce((acc,item)=>{
            return  acc +item.quantity*item.price;
        },0)
        
}
const Cart = mongoose.model("Cart", cartSchema);

module.exports= Cart;
