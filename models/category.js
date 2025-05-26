const mongoose=require('mongoose');

const categorySchema=mongoose.Schema({
    name:{
   type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    slug:{
   type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    productIds:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'Product',
      
    },
    
})
const Category=mongoose.model("Category",categorySchema);

module.exports=Category;