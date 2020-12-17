const mongoose = require("mongoose");
require("dotenv").config();

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose
      .connect(
        `mongodb+srv://admin:${process.env.DB_PASSWORD}@cluster0.2qob4.mongodb.net/twitterClone?retryWrites=true&w=majority`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
          useCreateIndex: true,
        }
      )
      .then(() => {
        console.log("DB Connected");
      })
      .catch((e) => {
        console.log("ERROR:" + e);
      });
  }
}

module.exports = new Database();
