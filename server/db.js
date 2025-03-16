const mongoose = require("mongoose");
const { exit } = require("process");

const connect = async () => {
  await mongoose
    .connect("mongodb://127.0.0.1:27017/stolotoBackend")
    .then((res) => {
      console.log("\u001b[32;1m ⚙️  App has connected to MongoDB");
    })
    .catch((err) => {
      console.log(err);
      exit(0);
    });
  console.log("\u001b[0m");
};

module.exports = connect;