const express = require("express");
const router = express.Router();

router.get("/register", (req, res, next) => {
  res.status(200).render("register");
});

module.exports = router;
