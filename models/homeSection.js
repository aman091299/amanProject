const mongoose = require("mongoose");

const homeSectionSchema = mongoose.Schema({
  
  componentName: { type: String, required: true },
  defaultProps: { type: Object, required: true },         // Display order
data: mongoose.Schema.Types.Mixed                // Dynamic props for component
}, { timestamps: true });

module.exports =  mongoose.model("HomeSection", homeSectionSchema);
