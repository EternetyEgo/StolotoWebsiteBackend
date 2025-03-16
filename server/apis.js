const express = require("express");
const cors = require("cors");

module.exports = (app) => {
  app.use(express.json());
  app.use(cors());
  app.use("/api/user", require("../routers/User-route"));
};