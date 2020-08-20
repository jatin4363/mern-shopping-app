const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const User = require("./models/user");

const config = require("./config/key");

// abc1234 <-password   jatin<-dbUser
mongoose
  .connect(
    config.mongoURI,
    { useNewUrlParser: true, useUnifiedTopology: true } //this removes duplication warning from mongoose
  )
  .then(() => console.log("DB connected"))
  .catch((err) => console.error(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("hello world");
});

app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);
  //   user
  //     .save()
  //     .then(() => res.status(200).json(`User '${req.body.name}' added!`))
  //     .catch((err) => res.status(400).json(`Unable to add user. Error: ${err}.`));
  user.save((err, userData) => {
    if (err) return res.json({ success: false }, err);
    return res.status(200).json({ success: true });
  });
});

app.listen(5000);
