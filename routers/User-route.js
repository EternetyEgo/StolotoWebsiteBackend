const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../models/User");
const auth = require("../security/auth");
const router = express.Router();

//! get me
router.get("/me", auth, async (req, res) => {
  const user = req.user;
  res.json({ data: user });
});

//! register
router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  try {
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: passwordHash,
    });

    await newUser.save();
    return res.status(201).json({ message: "Foydalanuvchi muvaffaqiyatli ro'yhatdan o'tdi" });
  } catch (error) {
    return res.status(500).json({ message: "Xatolik yuz berdi", error });
  }
});

//! login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!password) return res.status(400).json({ message: "Ma'lumot to'liq emas" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Username yoki parol hato" });

  const comparePass = await bcrypt.compare(password, user.password);
  if (!comparePass) return res.status(400).json({ message: "Parol yoki Email hato" });

  const token = jwt.sign({ user: user._id }, config.get("tokenPrivateKey"));
  res.json({ message: "Token yaratildi", token });
});

//! update user
router.post("/update", auth, async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const authUser = await User.findOne({ email: req.user.email });
  if (!authUser) return res.status(404).json({ message: "User not found" });

  try {
    authUser.firstname = firstname;
    authUser.lastname = lastname;
    authUser.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      authUser.password = await bcrypt.hash(password, salt);
    }

    await authUser.save();
    res.json({ message: "User yangilandi", authUser });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Xatolik yuz berdi", error: err });
  }
});

module.exports = router;