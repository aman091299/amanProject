const mongoose=require('mongoose');

const notifySchema=mongoose.Schema({
    emaildId:{
        type:String,
        required:true,
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    }
})

const Notify=mongoose.model("Notify",notifySchema);

module.exports=Notify;