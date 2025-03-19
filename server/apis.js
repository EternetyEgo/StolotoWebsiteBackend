const express = require("express");
const cors = require("cors");

module.exports = (app) => {
  app.use(
    cors({
      methods: ["GET", "POST", "DELETE"],
      origin: "*",
      credentials: true,
    })
  );
  app.use(express.json());

  app.use("/api/user", require("../routers/User-route"));
};