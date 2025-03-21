"use strict";
const express = require("express");

const app = express();
const port = process.env.PORT || 5050;

require("./server/db")(app);
require("./server/apis")(app);

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server started. Local IP: http://192.168.0.21:${port}`);
});