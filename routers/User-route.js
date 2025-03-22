const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../models/User");
const auth = require("../security/auth");
const router = express.Router();

//! get me
router.get("/me", auth, async (req, res) => {
  res.json({ data: req.user });
});

//! register
router.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "Barcha maydonlarni to'ldiring" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu email allaqachon ishlatilgan" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: passwordHash,
    });

    await newUser.save();
    res.status(201).json({ message: "Foydalanuvchi muvaffaqiyatli ro'yhatdan o'tdi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Xatolik yuz berdi", error });
  }
});

//! login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email va parolni kiriting" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email yoki parol noto‘g‘ri" });
    }

    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return res.status(400).json({ message: "Email yoki parol noto‘g‘ri" });
    }

    const token = jwt.sign({ user: user._id }, config.get("tokenPrivateKey"), { expiresIn: "1d" });
    res.json({ message: "Kirish muvaffaqiyatli", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server xatosi", error });
  }
});

//! update user
router.post("/update", auth, async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const authUser = await User.findById(req.user.id);

    if (!authUser) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    if (email && email !== authUser.email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) {
        return res.status(400).json({ message: "Bu email allaqachon ishlatilgan" });
      }
      authUser.email = email;
    }

    authUser.firstname = firstname || authUser.firstname;
    authUser.lastname = lastname || authUser.lastname;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      authUser.password = await bcrypt.hash(password, salt);
    }

    await authUser.save();
    res.json({ message: "Foydalanuvchi yangilandi", user: authUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server xatosi", error: err });
  }
});

//! user numbers
router.post("/create-number", auth, async (req, res) => {
  try {
    const { numbers } = req.body;
    const userId = req.user.id;
    console.log(numbers);

    if (!numbers || typeof numbers !== "object") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    user.numbers.push(numbers);
    await user.save();

    res.json({ message: "Raqamlar muvaffaqiyatli qo'shildi", numbers: user.numbers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server xatosi" });
  }
});

router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id; // Middleware orqali olinishi kerak
    const id = req.params.id;

    // Userni topish
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    // Kombinatsiyani o‘chirish
// Kombinatsiyani o‘chirish (backend)
user.numbers = user.numbers.filter((num) => num.id.toString() !== id);
await user.save();

    res.json({ success: true, message: "Комбинация удалена" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Ошибка удаления", error });
  }
});

module.exports = router;