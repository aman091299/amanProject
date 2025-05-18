const mongoose=require('mongoose');

const cartSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
  products:{
    type:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Product"
        },
        quantity:{
            type:Number,
            min:1,
            required:true,
        }
    }],
  },
  bill: {
    type: Number,
    required: true,
   default: 0
  }
})

const Cart=mongoose.model('Cart',cartSchema);

module.exports=Cart;