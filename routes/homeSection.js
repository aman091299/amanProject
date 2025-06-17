const express = require("express");
const HomeSection = require("../models/homeSection");
const { userAuth ,adminAuth} = require("../middleware/auth");
const sectionRouter = express.Router();
const CustomizeLayout=require("../models/cutomizeSection")
// CREATE SECTION API
sectionRouter.post("/home-sections/create", adminAuth, async (req, res) => {
  try {
    const { componentName, defaultProps, data } = req.body;

    if (!componentName || !defaultProps) {
      return res.status(400).json({ success: false, message: "componentName and defaultProps are required." });
    }

    const newSection = new HomeSection({ componentName, defaultProps, data });
    await newSection.save();

    res.status(201).json({ success: true, section: newSection });
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 2. Get all master components (shown in sidebar for selection)
sectionRouter.get("/home-sections", async (req, res) => {
  try {
    const sections = await HomeSection.find();
    res.status(200).json({ success: true, sections });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

sectionRouter.post("/customize-layout/add", async (req, res) => {
  try {
    const { componentName, props, position } = req.body;

    if (!componentName || !props || position === undefined) {
      return res.status(400).json({ success: false, message: "componentName, props, and position are required." });
    }

    let layout = await CustomizeLayout.findOne({ layoutName: "homepage" });
    if (!layout) layout = new CustomizeLayout({ layoutName: "homepage", components: [] });

    layout.components.splice(position, 0, { componentName, props });

    await layout.save();

    res.status(200).json({ success: true, layout });
  } catch (error) {
    console.error("Add error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 4. Get current customized homepage layout
sectionRouter.get("/customize-layout/:layoutName", async (req, res) => {
  try {
    const {layoutName}=req.params;
    const layout = await CustomizeLayout.findOne({ layoutName:layoutName });
    res.status(200).json({ success: true, layout });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 5. Update component at a given index
sectionRouter.put("/customize-layout/update/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const { componentName, props } = req.body;

    let layout = await CustomizeLayout.findOne({ layoutName: "homepage" });
    if (!layout || index < 0 || index >= layout.components.length) {
      return res.status(404).json({ success: false, message: "Component not found at given index" });
    }

    layout.components[index] = { componentName, props };
    await layout.save();

    res.status(200).json({ success: true, layout });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 6. Delete a component from layout by index
sectionRouter.delete("/customize-layout/delete/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    let layout = await CustomizeLayout.findOne({ layoutName: "homepage" });

    if (!layout || index < 0 || index >= layout.components.length) {
      return res.status(404).json({ success: false, message: "Component not found" });
    }

    layout.components.splice(index, 1);
    await layout.save();

    res.status(200).json({ success: true, layout });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = sectionRouter;
