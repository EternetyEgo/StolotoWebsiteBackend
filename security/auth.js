const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("config");

const auth = async function (req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Token bolmaganligi sabab sorov toxtatildi",
    });
  }
  try {
    const decoded = jwt.verify(token, config.get("tokenPrivateKey"));
    const user = await User.findById(decoded.user);
    req.user = user;
    next();
  } catch (err) {
    req.user = null;
    res.status(401).json({
      status: false,
      message: "Token is not valid",
    });
  }
};

module.exports = auth;