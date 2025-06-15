const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
    slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  description: {
    type: String,
  
    trim:true,
  },
  price: {
    type: Number,
   
  },
  stock: {
  type: Number,
  default: 0,
   min: [0, 'Stock cannot be negative']
},
isAvailable: {
  type: Boolean,
  default: true
},
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  actualPrice: {
    type: Number,
  
  },
  image: {
    type: [String],
     required:true,
  },
  weight: {
    type: String,
  },
  numberOfPieces: {
    type: String,
     trim: true,
  },
  serves: {
    type: String,
     trim: true,
  },
  combo:{
    type:Number,
     trim: true,
  },
  howToCook: {
    type: String,
    trim: true,
  },
  nutritionInfo: {
    
      image:{
        type:String,
        trim:true,
      },
      heading:{
        type:String,
        trim:true,
      },
      content:{
        type:[String],
        trim:true,
      }
    
  },
  moreInfo: {
  image:{
        type:String,
        trim:true,
      },
      heading:{
        type:String,
        trim:true,
      },
      content:{
        type:[String],
        trim:true,
      }
  },

  recipesInfo: {
 image:{
        type:String,
        trim:true,
      },
      heading:{
        type:String,
        trim:true,
      },
      content:{
        type:[String],
        trim:true,
      }
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

  // cookingTime: {
  //  minTime:{ type:Number,
  //     trim: true,
  //    },
  //     maxTime:{
  //       type:Number,
  //     trim: true,

  //     }
     
  // },
  metadata:[{
    key:{
      type:String,
      trim:true,
    },
    value:{
      type:String,
      trim:true,
    }
  }],
  searchEngineSlug:{
    type:String,
    trim:true,
  },
  searchEngineTitle:{
    type:String,
    trim:true,
  },
  searchEngineDescription:{
    type:String,
    trim:true,
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
cuts: [ {
    type: String,
      trim: true,
      lowercase:true,
  }],default:[],

},{timestamps:true} );
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
