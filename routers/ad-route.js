const express = require("express");
const router = express.Router();
const Ad = require("../models/ad");
const auth = require("../security/auth");

// POST — yangi Ad qo‘shish (faqat admin yoki token bilan)
router.post("/new-ad", auth, async (req, res) => {
  try {
    const newAd = new Ad(req.body);
    const savedAd = await newAd.save();
    res.status(201).json(savedAd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — barcha Ad'larni olish (token kerak emas)
router.get("/all", async (req, res) => {
  try {
    const ads = await Ad.find();
    res.status(200).json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — Ad o‘chirish (faqat token va admin)
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const deletedAd = await Ad.findByIdAndDelete(req.params.id);
    if (!deletedAd) {
      return res.status(404).json({ message: "Ad topilmadi" });
    }
    res.status(200).json({ message: "Ad o‘chirildi", ad: deletedAd });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;