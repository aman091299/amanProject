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
},
  },
  { timestamps: true }
);


cartSchema.methods.calculateTotalPrice=function(){
 
       return this.items.reduce((acc,item)=>{
            return  acc +item.quantity*item.price;
        },0)
}
const Cart = mongoose.model("Cart", cartSchema);

module.exports= Cart;
