const mongoose = require("mongoose");

const PricingSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // 'Date' emas, 'date' (standart nomlash uchun)
    price: { type: String, required: true }, // 'Price' emas, 'price'
    texts: { type: [String]}, // 'Texts' emas, 'texts'
    link: { type: String, default: "" }, // required false emas, default bo‘lsin
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pricing", PricingSchema);