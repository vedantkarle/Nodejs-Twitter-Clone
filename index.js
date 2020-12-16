const express = require("express");
const app = express();
const path = require("path");
const { isLoggedIn } = require("./middleware");

app.set("view engine", "pug");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));

//Routes
const loginRoutes = require("./routes/loginRoutes");
const registerRoutes = require("./routes/registerRoutes");

app.use("/", loginRoutes);
app.use("/", registerRoutes);

app.get("/", isLoggedIn, (req, res, next) => {
  let payload = {
    pageTitle: "Home",
  };

  res.status(200).render("home", payload);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server Started");
});
