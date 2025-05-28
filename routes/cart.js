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
      res.status(404).json({
        success: false,
        message: "Product do not exist",
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
        res.cookie("guestedCart", JSON.stringify(guestedCart), {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.status(200).json({
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

        res.cookie("guestedCart", JSON.stringify(cart), {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        res.status(200).json({
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

      const cartExist = await Cart.findOne({ userId });

      if (cartExist) {
        const index = cartExist.items.findIndex(
          (item) => item.productId.toString() === productId
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

cartRouter.get(
  "/cart/viewAllCartItems",
  identifyGuestAuth,
  async (req, res) => {
    try {
      if (req.isGuestedUser) {
        const cart = req.cookies.guestedCart
          ? JSON.parse(req.cookies.guestedCart)
          : [];
        return res.status(200).json({
          data: cart,
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

        const cart = await Cart.findOne({ userId }).populate('items.productId');
      
        if (!cart) {
          return res.status(200).json({
            data: cart,
            success: true,
            message: "Cart does not exist ",
          });
        }
        console.log("cart items product id",cart.items[0].productId);
      
        const newCart=cart?.items?.map((item)=>({
           name:item.productId.name,
          price:item.productId.price,
          itemQuantity:item.quantity,
          _id:item.productId._id,
          combo:item.productId.combo,
          actualPrice:item.productId.actualPrice
        
          }  ))
      
        
        return res.status(200).json({
          data: newCart,
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

module.exports = cartRouter;
