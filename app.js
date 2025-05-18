require('dotenv').config();

const connectDB = require('./config/database.js');
const authRouter=require('./routes/auth.js');
const profileRouter=require('./routes/profile.js');
const  productRouter=require('./routes/product.js');
const categoryRouter=require('./routes/category.js');

const cookieParser=require('cookie-parser');
const express=require('express');
const app=express();

app.use(express.json())
app.use(cookieParser())

app.use('/',authRouter);
app.use('/',profileRouter);
app.use('/',productRouter);
app.use('/',categoryRouter);

const port=process.env.PORT || 3000;

connectDB().then(()=>{
    console.log("DB connected Sucessfully");
app.listen(port,()=>{
    console.log("server is  running on port " + port);
    
})
}).catch((err)=>{
 console.error("Something went wrong in DB", error);
})
