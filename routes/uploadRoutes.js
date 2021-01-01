const express = require("express");
const router = express.Router();
const path = require("path");
const User = require("../models/User");

router.get("/images/:path", async (req, res, next) => {
  res.sendFile(path.join(__dirname, "../uploads/images/" + req.params.path));
});

module.exports = router;
