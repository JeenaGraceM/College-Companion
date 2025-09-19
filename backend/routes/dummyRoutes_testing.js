const express = require("express");
const { generateDummyToken, DUMMY_USER } = require("../utils/dummyAuth_testing");

const router = express.Router();

// Route to get a dummy token
router.get("/token", (req, res) => {
  console.log("Dummy token route hit!")
  const token = generateDummyToken();
  res.json({ token });
});

router.get("/user", (req, res) => {
  console.log("Dummy user route hit!")
  res.json(DUMMY_USER);
});

module.exports = router;