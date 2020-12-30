const express = require("express");
const router = express.Router();
const User = require("../../models/User");

router.put("/:userId/follow", async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);

  if (user === null) {
    return res.sendStatus(404);
  }

  const isFollowing =
    user.followers && user.followers.includes(req.session.user._id);

  const option = isFollowing ? "$pull" : "$addToSet";

  req.session.user = await User.findByIdAndUpdate(
    req.session.user._id,
    {
      [option]: { following: userId },
    },
    { new: true }
  ).catch((e) => {
    console.log(e);
    return res.sendStatus(400);
  });

  await User.findByIdAndUpdate(
    userId,
    {
      [option]: { followers: req.session.user._id },
    },
    { new: true }
  ).catch((e) => {
    console.log(e);
    return res.sendStatus(400);
  });

  res.status(200).send(req.session.user);
});

router.get("/:userId/following", async (req, res, next) => {
  const user = await User.findById(req.params.userId)
    .populate("following")
    .catch((e) => {
      console.log(e);
      return res.sendStatus(404);
    });

  res.status(200).send(user);
});

router.get("/:userId/followers", async (req, res, next) => {
  const user = await User.findById(req.params.userId)
    .populate("followers")
    .catch((e) => {
      console.log(e);
      return res.sendStatus(404);
    });

  res.status(200).send(user);
});

module.exports = router;