const mongoose = require("mongoose");


const CustomizeComponentSchema = new mongoose.Schema({
  componentName: { type: String, required: true },
  props: { type: Object, required: true },
});

const CustomizeLayoutSchema = new mongoose.Schema({
    layoutName: { type: String, default: "homepage" },
  components: [CustomizeComponentSchema]
});

module.exports =  mongoose.model("CustomizeLayout", CustomizeLayoutSchema );
