const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Chat = require("../../models/Chat");

router.post("/", async (req, res, next) => {
  if (!req.body.users) {
    console.log("Users param not sent!");
    return res.sendStatus(400);
  }

  const users = JSON.parse(req.body.users);

  if (users.length === 0) {
    console.log("Users array is empty");
    return res.sendStatus(400);
  }

  users.push(req.session.user);

  const chatData = {
    users: users,
    isGroupChat: true,
  };

  const chat = await Chat.create(chatData).catch((e) => {
    console.log(e);
    return res.sendStatus(400);
  });

  res.status(200).send(chat);
});

router.get("/", async (req, res, next) => {
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: req.session.user._id } },
  }).catch((e) => {
    console.log(e);
    return res.sendStatus(400);
  });

  chats = await User.populate(chats, { path: "users" });

  res.status(200).send(chats);
});

module.exports = router;
