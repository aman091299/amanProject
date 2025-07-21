require('dotenv').config();
const cors=require('cors')
const connectDB = require('./config/database.js');
const authRouter=require('./routes/auth.js');
const productRouter=require('./routes/product.js');

const cookieParser=require('cookie-parser');
const express=require('express');
const app=express();

app.use(cors({
     origin: ['http://localhost:3000',
        'http://localhost:3001', 
           'http://localhost:7000', 
        'https://ecommerce-frontend-one-fawn.vercel.app',
     'https://ecommerce-frontend-one-fawn.vercel.app/',
     'https://cambaytiger-dashboard-ixvk-git-main-aman091299s-projects.vercel.app',
     'https://cambaytiger-dashboard-ixvk.vercel.app'], 
    credentials:true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/',authRouter);
app.use('/',productRouter);


const port=process.env.PORT || 3000;

connectDB().then(()=>{
    console.log("DB connected Sucessfully");
app.listen(port,()=>{
    console.log("server is  running on port " + port);
    
})
}).catch((err)=>{
 console.error("Something went wrong in DB", err);
})
