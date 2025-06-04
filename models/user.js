
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken')
const addressSchema=mongoose.Schema({
  label:{
    type:String,
    enum:["Home","Office","Others"],
    default:"Home"
  },
  landmark:{
    type:String,
    trim:true,
    lowercase:true,
    required:true,
  },
    street:{
        type:String,
        required:true,
          trim:true,
    lowercase:true,
    },
    city:{
        type:String,
       default:'Mumbai'
    },
    state:{
        type:String,
           default:'Maharastra'
    },
    pinCode:{
        type:Number,
        required:true,
          trim:true,

    },
    country:{
        type:String,
        default:'INDIA'
    },
      isDefault: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

const userSchema=mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },
      lastName:{
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
      addresses:[addressSchema],
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