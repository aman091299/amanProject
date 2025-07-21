
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken')


const userSchema=mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },
     
    password:{
      type:String,
      required:true,
      trim:true,
    },
      emailId:{
      type:String,
      required:true,
      lowercase:true,
      trim:true,
      unique:true,
        },
     
})


const User=mongoose.model('User',userSchema);

module.exports=User;