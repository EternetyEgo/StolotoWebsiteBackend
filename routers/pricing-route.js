const express = require("express");
const router = express.Router();
const Pricing = require("../models/pricing");

// POST — Yangi Pricing qo‘shish
router.post("/new", async (req, res) => {
  try {
    const newPricing = new Pricing(req.body);
    const savedPricing = await newPricing.save();
    res.status(201).json(savedPricing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — Barcha Pricing larni olish
router.get("/all", async (req, res) => {
  try {
    const pricings = await Pricing.find();
    res.status(200).json(pricings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — Pricingni o‘chirish
router.post("/delete/:id", async (req, res) => {
    try {
      const deletedPricing = await Pricing.findByIdAndDelete(req.params.id);
      if (!deletedPricing) {
        return res.status(404).json({ message: "Pricing topilmadi" });
      }
      res.status(200).json({ message: "Pricing muvaffaqiyatli o‘chirildi" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

module.exports = router;