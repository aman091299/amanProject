const express=require('express');
const{userAuth}=require('../middleware/auth')
const Cart=require('../models/cart')
const cartRouter=express.Router();



cartRouter.post("/cart/addItem",userAuth(),async(req,res)=>{

     try {
        const {productId,quantity,userId}=req.body;

         if (!productId) {
     return  res.status(400).json({success: false,message:"productId is required"})
    }
         if (!quantity) {
     return  res.status(400).json({success: false,message:"quantity is required"})
    }
         if (!userId) {
     return  res.status(400).json({success: false,message:"userId is required"})
    }
        
        
        const cartExist=await Cart.findById(userId);
        if(cartExist){
            const index= cartExist.items.findIndex(item=> item.productId===productId);
            if(index !== -1 && quantity===0){
                   cartExist.items.splice(index,1)
            }
            else if(index !== -1){
                cartExist.items[index].quantity=quantity;
            }
            else{
                cartExist.items.push({
                    productId,
                    quantity
                })
            }
          await   cartExist.save()
             
        return res.status(200).json({
            success:true,
            data:cartExist,
            message:"Succefully cart item added"
        })
        }
    
        const cart=new Cart({
          items: [
             productId,
            quantity
        ],
            userId,
        })
        await cart.save();
        
        
        res.status(200).json({
            success:true,
            data:cart,
            message:"Succefully cart item created"
        })
     } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error while creating cart item : " + error,
        })
     }
})


module.exports=cartRouter;