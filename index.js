"use strict";
const express = require("express");

const app = express();
const port = process.env.PORT || 5050;

require("./server/db")(app);
require("./server/apis")(app);

app.listen(port, () => {
  console.log(`\u001b[33m 🚀 Server started. \n\u001b[32m Local IP: http://127.0.0.1:${port}`);
});