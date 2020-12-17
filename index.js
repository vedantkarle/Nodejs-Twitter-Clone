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

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);

app.get("/", (req, res, next) => {
  let payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
  };

  res.status(200).render("home", payload);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server Started");
});