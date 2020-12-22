const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

router
  .route("/")
  .get((req, res, next) => {
    res.status(200).render("login");
  })
  .post(async (req, res, next) => {
    const username = req.body.logUsername;
    const password = req.body.logPassword;

    const payload = req.body;

    if (req.body.logUsername && req.body.logPassword) {
      const user = await User.findOne({ username: username }).catch((e) => {
        console.log(e);
        payload.errorMessage = "Something Went Wrong!!";
        res.status(200).render("login", payload);
      });

      if (user !== null) {
        const result = await bcrypt.compare(password, user.password);

        if (result) {
          req.session.user = user;
          return res.redirect("/");
        }
      }

      payload.errorMessage = "Incorrect Credentials!";
      return res.status(200).render("login", payload);
    } else {
      payload.errorMessage = "Make Sure Each Field Has A Valid Value!";
      res.status(200).render("login", payload);
    }
  });

module.exports = router;
