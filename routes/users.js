const express=require('express');

const userRouter=express.Router();

userRouter.get('/user',(req,res)=>{
   res.send("this is user route")
})

module.exports=userRouter;