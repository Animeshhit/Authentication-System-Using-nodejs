const express = require("express");
const Router = express.Router();
const User = require("../model/model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.SECRET_KEY;

Router.get("/", (req, res) => {
  res.send("hello");
});

Router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be atleast 6 letter long" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object (you can save it to a database here)
    const user = new User({
      username,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    // Generate a JWT token
    const token = jwt.sign({ username }, secretKey);

    // Return the token to the client
    res.json({ token });
  } catch (error) {
    console.error("Failed to register user:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
});

// Login user
Router.post("/login", async (req, res) => {
  // Extract user data from the request body
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, secretKey);

    // Return the token to the client
    res.json({ token });
  } catch (error) {
    console.error("Failed to login user:", error);
    res.status(500).json({ message: "Failed to login user" });
  }
});

// Middleware function to authenticate token
function authenticateToken(req, res, next) {
  const token = req.query.api_key;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
}

Router.get("/user", authenticateToken, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

module.exports = Router;
