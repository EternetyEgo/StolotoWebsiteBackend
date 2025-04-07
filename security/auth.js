const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("config");

const auth = async function (req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Token yo‘q",
    });
  }

  try {
    const decoded = jwt.verify(token, config.get("tokenPrivateKey"));
    const user = await User.findById(decoded.user);

    if (!user) {
      return res.status(401).json({ status: false, message: "User topilmadi" });
    }

    req.user = user;

    // Endi ADMINmi yoki yo‘qmi — tekshiramiz
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Ruxsat yo‘q" });
    }

    next();
  } catch (err) {
    res.status(401).json({ status: false, message: "Token noto‘g‘ri" });
  }
};

module.exports = auth;