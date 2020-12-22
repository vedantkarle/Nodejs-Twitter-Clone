const express = require("express");
const router = express.Router();

router.route("/").get((req, res, next) => {
  if (req.session) {
    req.session.destroy(() => {
      return res.redirect("/login");
    });
  }
});

module.exports = router;
