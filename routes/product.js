
const User=require("../models/user");
const express = require("express");


const productRouter = express.Router();



productRouter.post("/Name", async (req, res) => {
  try {
    console.log("Inside /Name route");

    const userText = req.body.name;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!userText) {
      return res.status(400).json({
        success: false,
        message: "Name is required in the request body",
      });
    }
  console.log("user",userText)
    const users = await User.find({
      firstName: { $regex: userText, $options: "i" },
    })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: `Found ${users.length} user for '${userText}'`,
      
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while searching product by name: " + error.message,
    });
  }
});



module.exports = productRouter;
