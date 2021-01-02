const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });

router.get("/", async (req, res, next) => {
  let searchObj = req.query;

  if (searchObj.search !== undefined) {
    searchObj = {
      $or: [
        { firstName: { $regex: searchObj.search, $options: "i" } },
        { lastName: { $regex: searchObj.search, $options: "i" } },
        { userName: { $regex: searchObj.search, $options: "i" } },
      ],
    };
  }

  const results = await User.find(searchObj).catch((e) => {
    console.log(e);
    return res.sendStatus(400);
  });

  res.status(200).send(results);
});

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

router.post(
  "/profilePicture",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("No File Uploaded");
      return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;

    const tempPath = req.file.path;

    const targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error !== null) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { profilePic: filePath },
        { new: true }
      );

      res.sendStatus(204);
    });
  }
);

router.post(
  "/coverPhoto",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("No File Uploaded");
      return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;

    const tempPath = req.file.path;

    const targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error !== null) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { coverPhoto: filePath },
        { new: true }
      );

      res.sendStatus(204);
    });
  }
);

module.exports = router;
