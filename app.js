const userRouter=require('./routes/users.js')

const express=require('express');

const app=express();

app.use('/',userRouter);
app.get('/',(req,res)=>{
   res.send("node js is started");
})
const port=process.env.PORT || 3000;
app.listen(port,()=>{
    console.log("server is  running");
    
})