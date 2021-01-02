const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res, next) => {
  let payload = createPayload(req);

  res.status(200).render("search", payload);
});

router.get("/:selectedTab", async (req, res, next) => {
  let payload = createPayload(req);
  payload.selectedTab = req.params.selectedTab;

  res.status(200).render("search", payload);
});

function createPayload(req, res) {
  return {
    pageTitle: "Search",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
}

module.exports = router;
