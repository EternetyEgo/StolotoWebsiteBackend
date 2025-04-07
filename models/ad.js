const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema(
  {
    badge: { type: String, required: true },
    websiteName: { type: String, required: true },
    title: { type: String, required: true},
    link: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ad", AdSchema); 