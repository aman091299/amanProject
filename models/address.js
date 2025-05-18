const mongoose=require('mongoose');

const addressSchema=mongoose.Schema({
    street:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    zipcode:{
        type:String,
        requird:true,
    },
    country:{
        type:String,
        required:true,
        default:'INDIA'
    }
})

const Address=mongoose.model('Address',addressSchema);

module.exports=Address;