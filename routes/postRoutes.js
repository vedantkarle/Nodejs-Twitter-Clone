const express = require("express");
const router = express.Router();

router.get("/:id", (req, res, next) => {
  let payload = {
    pageTitle: "View Post",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: JSON.stringify(req.params.id),
  };

  res.status(200).render("post", payload);
});

module.exports = router;
