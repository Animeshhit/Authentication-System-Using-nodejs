const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();i

const url = process.env.MONGOURL;

const connectToDb = (callback) => {
  mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Connected to MongoDB Atlas");
      callback(true);
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB Atlas:", err);
      callback(false);
    });
};

module.exports = connectToDb;
