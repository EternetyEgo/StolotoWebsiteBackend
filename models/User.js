const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    telegramId: { type: Number },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "USER" },
    numbers: { type: [], default: [] },
    balance: { type: Number, default: 0 },
    checkStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", UserSchema);