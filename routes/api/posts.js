const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Post = require("../../models/Post");

router
  .route("/")
  .get((req, res, next) => {})
  .post(async (req, res, next) => {
    if (!req.body.content) {
      console.log("Content not sent!");
      return res.sendStatus(400);
    }

    const postData = {
      content: req.body.content,
      postedBy: req.session.user,
    };

    const post = await Post.create(postData).catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });

    await post.populate("postedBy").execPopulate();

    res.status(201).send(post);
  });

module.exports = router;
