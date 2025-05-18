const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  actualPrice: {
    type: String,
    required: true,
  },
  image: {
    type: [String],
    //  required:true,
  },
  weight: {
    type: String,
  },
  numberOfPieces: {
    type: String,
  },
  servers: {
    type: String,
  },

  howToCook: {
    type: String,
    trim: true,
  },
  nutrition: {
    type: String,
    trim: true,
  },
  info: {
    type: String,
    trim: true,
  },
  recipes: {
    image: { type: String, trim: true },
    recipesInfo: { type: String, trim: true },
  },
  
  tags:[ {
    type: String,
      trim: true,
      lowercase:true,
     
  }],default:[],

  discount: {
    type: Number,
  },
   healthBenefits: [ {
    type: String,
      trim: true,
      lowercase:true,
     
  }],default:[],

  cookingTime: {
   minTime:{ type:Number,
      trim: true,
     },
      maxTime:{
        type:Number,
      trim: true,

      }
     
  },

  bestSuitedFor: [ {
    type: String,
      trim: true,
      lowercase:true,
     
  }],default:[],

  boneType: {
    type: String, // Example: "Boneless", "With Bone"
    trim: true,
    lowercase:true,
  },

  cutType: [ {
    type: String,
      trim: true,
      lowercase:true,
  }],default:[],

});
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
