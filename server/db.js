const mongoose = require("mongoose");
const { exit } = require("process");

const connect = async () => {
  await mongoose
    .connect("mongodb://mongo:NiypZbntFUWIhpyguMdWmDyFgnHCjrmT@switchyard.proxy.rlwy.net:27898/stoloto?authSource=admin", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("\u001b[32;1m ⚙️  App has connected to MongoDB");
    })
    .catch((err) => {
      console.log(err);
      exit(0);
    });
  console.log("\u001b[0m");
};

module.exports = connect;