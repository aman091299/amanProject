
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken')

const userSchema=mongoose.Schema({
    name:{
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
      address:{
        type:mongoose.Schema.Types.ObjectId,
         ref:'Address'
      },
      role:{
        type:String,
        enum:['student','admin'],
        default:'student'
            }
})

userSchema.methods.generateAuthToken=async function(){
  const user=this;
  const token=await jwt.sign({_id:user._id.toString(),role:user.role},process.env.JWT_SECRET_KEY);
return token;
}
const User=mongoose.model('User',userSchema);

module.exports=User;