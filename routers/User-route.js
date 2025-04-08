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

//! get all users
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server xatosi", error: err });
  }
});

//! edit balance user (faqat ADMIN uchun)
router.post("/me/:id/balance", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { balance } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Sizda bu amalni bajarish uchun ruxsat yo'q" });
    }

    if (balance === undefined || balance === null) {
      return res.status(400).json({ message: "Balance is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    user.balance = balance;
    await user.save();

    res.json({ message: "Hisob muvaffaqiyatli yangilandi", user });
  } catch (error) {
    console.error("Xatolik:", error.message, error.stack);
    res.status(500).json({ message: "Server xatosi", error: error.toString() });
  }
});

//! delete user
router.delete("/me/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Ruxsat berilmagan" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    res.json({ message: "Foydalanuvchi o‘chirildi", user });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
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

router.post("/check-admin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Parolni bcrypt.compare yordamida tekshirish
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "You do not have admin access" });
    }

    const token = jwt.sign({ user: user._id }, config.get("tokenPrivateKey"), { expiresIn: "30d" });

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

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

    const token = jwt.sign({ user: user._id }, config.get("tokenPrivateKey"), { expiresIn: "30d" });
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
    const userId = req.user.id;
    const id = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    user.numbers = user.numbers.filter((num) => {
      if (!num || typeof num !== "object" || !num.id) {
        return true;
      }
      return num.id.toString() !== id.toString();
    });
    await user.save();

    res.json({ success: true, message: "Комбинация удалена" });
  } catch (error) {
    console.error("Xatolik:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Ошибка удаления", error: error.toString() });
  }
});

router.post("/check", async (req, res) => {
  const { userId, pricingId } = req.body;

  try {
    const user = await User.findById(userId);
    const pricing = await Pricing.findById(pricingId);

    if (!user || !pricing) {
      return res.status(404).json({ success: false, message: "User yoki Pricing topilmadi" });
    }

    const price = parseFloat(pricing.price); // string bo‘lsa son qilamiz
    // Sotib olishda checkStatus yangilanishi
    if (user.balance >= price) {
      user.balance -= price;
      if (!user.numbers.includes(pricingId)) {
        user.numbers.push(pricingId);
      }
      user.checkStatus = true; // Check holatini yangilaymiz
      await user.save();

      return res.status(200).json({ success: true, message: "Sotib olindi", balance: user.balance });
    } else {
      return res.status(400).json({ success: false, message: "Pul yetarli emas" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
