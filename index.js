const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const { isLoggedIn } = require("./middleware");
require("dotenv").config();

//DB Connection
require("./database");

app.set("view engine", "pug");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

//Routes
const loginRoutes = require("./routes/loginRoutes");
const registerRoutes = require("./routes/registerRoutes");
const logoutRoutes = require("./routes/logoutRoutes");
const postRoutes = require("./routes/postRoutes");
const profileRoutes = require("./routes/profileRoutes");
const uploadsRoutes = require("./routes/uploadRoutes");
const searchRoutes = require("./routes/searchRoutes");

//Api Routes
const postsApiRoutes = require("./routes/api/posts");
const usersApiRoutes = require("./routes/api/users");

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/logout", logoutRoutes);
app.use("/posts", isLoggedIn, postRoutes);
app.use("/profile", isLoggedIn, profileRoutes);
app.use("/uploads", uploadsRoutes);
app.use("/search", searchRoutes);

app.use("/api/posts", postsApiRoutes);
app.use("/api/users", usersApiRoutes);

app.get("/", isLoggedIn, (req, res, next) => {
  let payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  res.status(200).render("home", payload);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server Started");
});
