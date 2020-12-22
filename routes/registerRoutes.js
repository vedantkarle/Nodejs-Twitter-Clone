const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

router
  .route("/")
  .get((req, res, next) => {
    res.status(200).render("register");
  })
  .post(async (req, res, next) => {
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;

    const payload = req.body;

    if (firstName && lastName && username && email && password) {
      const existingUser = await User.findOne({
        $or: [{ username: username }, { email: email }],
      }).catch((e) => {
        console.log(e);
        payload.errorMessage = "Something Went Wrong!!";
        res.status(200).render("register", payload);
      });

      if (existingUser === null) {
        //No User Found
        const data = req.body;

        data.password = await bcrypt.hash(password, 10);

        const user = await User.create(data);

        req.session.user = user;

        return res.redirect("/");
      } else {
        //User Found
        if (email === existingUser.email) {
          payload.errorMessage = "Email already in use!";
        } else {
          payload.errorMessage = "Username already in use!";
        }
        res.status(200).render("register", payload);
      }
    } else {
      payload.errorMessage = "Make Sure Each Field Has A Valid Value!";
      res.status(200).render("register", payload);
    }
  });

module.exports = router;
