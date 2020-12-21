const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Post = require("../../models/Post");

router
  .route("/")
  .get(async (req, res, next) => {
    const posts = await Post.find({})
      .populate("postedBy")
      .sort({ createdAt: -1 })
      .catch((e) => {
        console.log(e);
        res.sendStatus(400);
      });

    return res.status(200).send(posts);
  })
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

    res.status(201).send(post);
  });

router.put("/:id/like", async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;

  const isLiked =
    req.session.user.likes && req.session.user.likes.includes(postId);

  const option = isLiked ? "$pull" : "$addToSet";

  //Insert user like
  req.session.user = await User.findByIdAndUpdate(
    userId,
    {
      [option]: { likes: postId },
    },
    { new: true }
  ).catch((e) => {
    console.log(e);
    res.sendStatus(400);
  });

  //Insert post like
  const post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { likes: userId } },
    { new: true }
  ).catch((e) => {
    console.log(e);
    res.sendStatus(400);
  });

  res.status(200).send(post);
});

router.post("/:id/retweet", async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;

  //Try and delete retweet
  const deletedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  }).catch((e) => {
    console.log(e);
    res.sendStatus(400);
  });

  const option = deletedPost != null ? "$pull" : "$addToSet";

  let repost = deletedPost;

  if (repost === null) {
    repost = await Post.create({ postedBy: userId, retweetData: postId }).catch(
      (e) => {
        console.log(e);
        res.sendStatus(400);
      }
    );
  }

  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { retweets: repost._id } },
    { new: true }
  ).catch((e) => {
    console.log(e);
    res.sendStatus(400);
  });

  const post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { retweetUsers: userId } },
    { new: true }
  ).catch((e) => {
    console.log(e);
    res.sendStatus(400);
  });

  return res.status(200).send(post);
});

module.exports = router;
