const mongoose=require('mongoose');
const User=require('./user')

const paymentSchema=new mongoose.Schema({
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Order'
    },
    userId:{
       type:mongoose.Schema.Types.ObjectId,
       ref:'User',
       required:true,

    },
    dateOfPayment:{
        type:Date,
        required:true,
    },
    status:{
        type:String,
        required:true,
    },
    amount:{
        type:String,
        required:true,
    },
    membershipType:{
        type:String,
    },
    currency:{
        type:String,
    },
    notes:{
        firstName:{
            type:String,
        },
        lastName:{
            type:String,
        },
        membershipType:{
            type:String,
        }
    }

},{timestamps:true});


const Payment=mongoose.model('Payment',paymentSchema);

module.exports=Payment;