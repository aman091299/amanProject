const express = require("express");
const { userAuth, identifyGuestAuth } = require("../middleware/auth");
const Cart = require("../models/cart");
const Product = require("../models/product");
const cartRouter = express.Router();

cartRouter.post("/cart/addItem", identifyGuestAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }
    if (quantity === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "quantity is required " });
    }
    if (quantity < 0) {
      return res
        .status(400)
        .json({ success: false, message: "quantity cannot be negative " });
    }

    const product = await Product.findById(productId);
    if (!product) {
    return  res.status(404).json({
        success: false,
        message: "Product not exist",
      });
    }

    if (req.isGuestedUser) {
      //checking where it has cart in cookie

      const guestedCart = req.cookies.guestedCart
        ? JSON.parse(req.cookies.guestedCart)
        : [];
      if (guestedCart.length !== 0) {
        //it has cart so update the cart
        const index = guestedCart.findIndex(
          (cartItem) => cartItem._id === productId
        );
        //now if we find the index

        if (index !== -1 && quantity === 0) {
          guestedCart.splice(index, 1);

        } else if (index !== -1) {
          guestedCart[index].itemQuantity = quantity;

        } else {

          if (quantity !== 0) {
            const { name, price, _id, combo, actualPrice } = product;
            guestedCart.push({
              itemQuantity: quantity,
              name: name,
              price: price,
              _id: _id,
              combo: combo,
              actualPrice: actualPrice,
            });
          }
        }
         console.log("gusetedcart1",guestedCart);
        guestedCart.totalPrice=guestedCart?.reduce((sum,item)=>sum + item.itemQuantity*item.price,0);
        guestedCart.originalTotalPrice=guestedCart.totalPrice;
         console.log("gusetedcart",guestedCart.totalPrice);
        console.log("gusetedcart2",guestedCart);
        res.cookie("guestedCart", JSON.stringify(guestedCart), {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              secure: true,
          sameSite: "none",
          httpOnly: true,  
        });

       return res.status(200).json({
          success: true,
          data: guestedCart,
          message: "Successfully guested cart add in cookies",
        });
      } else {
        // create a cart
        const { name, price, _id, combo, actualPrice } = product;
        const cart = [
          {
            itemQuantity: quantity,
            name: name,
            price: price,
            _id: _id,
            combo: combo,
            actualPrice: actualPrice,
          },
        ];
         cart.totalPrice=actualPrice;
         cart.originalTotalPrice=actualPrice;
        res.cookie("guestedCart", JSON.stringify(cart), {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            secure: true,
          sameSite: "none",
          httpOnly: true,  
        });
       return res.status(200).json({
          success: true,
          data: cart,
          message: "Successfully guested cart add in cookies",
        });
      }
    } else {
      const { _id } = req.user;
      const userId = _id;

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "userId is required" });
      }

        const cartExist = await Cart.findOne({ userId }).populate("items.productId").sort({ createdAt: -1 });
      if (cartExist) {
           const index = cartExist.items.findIndex(
          (item) => item.productId._id.toString() === productId.toString()
        );

        if (index !== -1 && quantity === 0) {
          cartExist.items.splice(index, 1);
        } else if (index !== -1) {
          cartExist.items[index].quantity = quantity;
        } else {
          cartExist.items.push({
            productId,
            quantity,
            price: product.price,
          });
        }

        const totalPrice = cartExist.calculateTotalPrice();
        cartExist.totalPrice = totalPrice;
        cartExist.originalTotalPrice=totalPrice;

        await cartExist.save();

        return res.status(200).json({
          success: true,
          data: cartExist,
          message: " cart updated Successfully ",
        });
      }
      const newCart = new Cart({
        items: [
          {
            productId,
            quantity,
            price: product.price,
          },
        ],
        userId,
        totalPrice: product.price,
         originalTotalPrice:product.price
      });
      await newCart.save();

      res.status(200).json({
        success: true,
        data: newCart,
        message: "Successfully cart item created",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while creating cart item : " + error,
    });
  }
});

cartRouter.get( "/cart/viewAllCartItems",identifyGuestAuth, async (req, res) => {
    try {
      if (req.isGuestedUser) {
        const cart = req.cookies.guestedCart
          ? JSON.parse(req.cookies.guestedCart)
          : [];
        return res.status(200).json({
          data: {cart,totalPrice:cart.totalPrice},
          success: true,
          message: "Gotten guested cart data successfully",
        });
      } else {
        const { _id } = req.user;
        const userId = _id;

        if (!userId) {
          return res
            .status(400)
            .json({ success: false, message: "userId is required" });
        }

        const cart = await Cart.findOne({ userId }).populate("items.productId").sort({ createdAt: -1 });

        if (!cart) {
          return res.status(200).json({
            data: [],
            success: true,
            message: "Cart does not exist ",
          });
        }

        const newCart = cart?.items?.map((item) => ({
          name: item.productId.name,
          price: item.productId.price,
          itemQuantity: item.quantity,
          _id: item.productId._id,
          combo: item.productId.combo,
          actualPrice: item.productId.actualPrice,
        }));

        return res.status(200).json({
          data: {cart:newCart,totalPrice:cart.totalPrice,discount:cart.discount, originalTotalPrice:cart.originalTotalPrice},
          success: true,
          message: "Getting cart data successfully",
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error while getting cart item : " + err,
      });
    }
  }
);

cartRouter.post("/cart/merge", identifyGuestAuth, async (req, res) => {
  try {
    //first check a user is loggin and having guestedCart

    if (!req.isGuestedUser && req.cookies.guestedCart) {
      const userId = req.user._id;

      const guestedCart = JSON.parse(req.cookies.guestedCart);
      console.log("gusetedCart",guestedCart);

      //push the guestedCart data in db but if user having some items in cart we should update the item quantity

             const cartExist = await Cart.findOne({ userId }).populate("items.productId").sort({ createdAt: -1 });

      if (cartExist) {
        //Now we are updating the user product quantity
        guestedCart.forEach((guestedItem) => {
          const existingItem = cartExist.items.find(
            (item) =>
              item.productId._id.toString() === guestedItem._id.toString()
          );
          if (existingItem) {
            existingItem.quantity += guestedItem.itemQuantity;
          } else {

            cartExist.items.push({
              productId: guestedItem._id,
              quantity: guestedItem.itemQuantity,
              price: guestedItem.price,
            });
          }
        });
        const totalPrice = cartExist.calculateTotalPrice();
        cartExist.totalPrice = totalPrice;
        cartExist.originalTotalPrice=totalPrice;
        await cartExist.save();
        const updatedCart = await Cart.findOne({ userId }).populate("items.productId").sort({ createdAt: -1 });
        const newCart = updatedCart?.items?.map((item) => ({
          name: item.productId.name,
          price: item.productId.price,
          itemQuantity: item.quantity,
          _id: item.productId._id,
          combo: item.productId.combo,
          actualPrice: item.productId.actualPrice,
        }));
         res.clearCookie('guestedCart');
        return res.status(200).json({
          success: true,
          data: {newCart,totalPrice:updatedCart, originalTotalPrice:updatedCart.totalPrice},
          message: "Cart merge successfully with guested Item",
        });
      } else {
        const newCartItems = guestedCart.map((guestedItem) => ({
          productId: guestedItem._id,
          price: guestedItem.price,
          quantity: guestedItem.itemQuantity,
        }));

        const cart = new Cart({
          items: newCartItems,
          userId,
        });
          const totalPrice = cart.calculateTotalPrice();
        cart.totalPrice = totalPrice;
         cart.originalTotalPrice=totalPrice;
        await cart.save();

        res.clearCookie('guestedCart');

        return res.status(200).json({
          success: true,
          data: {guestedCart,totalPrice,originalTotalPrice},
          message: "After data merge cart created successfully ",
        });
      }
      //guestedCart is an array of object
    }
        res.status(200).json({ success: true,data:[],message: 'No guest cart to merge' });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error while merge cart item : " + err,
    });
  }
});

cartRouter.post("/cart/deliverySlot",userAuth,async(req,res)=>{
  try{
    const {deliveryDate,deliverySlot}=req.body;
       if (!deliverySlot) {
      return res
        .status(400)
        .json({ success: false, message: "Delivery slot is required" });
    }
      if (!deliveryDate) {
      return res
        .status(400)
        .json({ success: false, message: "Delivery date is required" });
    }
      const cart =await Cart.findOne({userId:req.user._id}).sort({createdAt:-1});

       if (!cart) {
    return  res.status(404).json({
        success: false,
        message: "Cart do not exist",
      });
    }
    cart.deliveryDate=deliveryDate;
    cart.deliverySlot=deliverySlot;
    await cart.save();

        return  res.status(200).json({
        success: true,
        message: "Cart delivery data and time added successfully",
      });

  }
  catch(err){
    res.status(500).json({
      success: false,
      message: "Error creating delivery slot and data: " + err,
    });
  }
})

module.exports = cartRouter;
