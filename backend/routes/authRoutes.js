const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/users");
const generateToken = require("../utils/generateToken");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// ---------------------
// SIGNUP
// ---------------------
router.post("/signup", async (req, res) => {
  try {
    const { fullName, dateOfBirth, email, password, role, branch, rollNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      fullName,
      dateOfBirth,
      email,
      password: hashedPassword,
      role,
      branch,
      rollNumber,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Send response with user info
    res.json({
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branch: user.branch,
        rollNumber: user.rollNumber,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// LOGIN
// ---------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT token
    const token = generateToken(user);

    // Send response with user info
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branch: user.branch,
        rollNumber: user.rollNumber,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// PROTECTED PROFILE
// ---------------------
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
