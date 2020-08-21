const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const User = require("./models/user");
const auth = require("./middleware/auth");

const config = require("./config/key");

// abc1234 <-password   jatin<-dbUser
mongoose
  .connect(
    config.mongoURI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    } //this removes duplication warning from mongoose
  )
  .then(() => console.log("DB connected"))
  .catch((err) => console.error(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("hello world");
});

// III) get authenticated by getting checked if the token is there or not which was generated
app.get("/api/user/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req._id,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
  });
});

//I) user registers here with details
app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);
  //   user
  //     .save()
  //     .then(() => res.status(200).json(`User '${req.body.name}' added!`))
  //     .catch((err) => res.status(400).json(`Unable to add user. Error: ${err}.`));

  //before saving the user we hash the password in models/user.js
  user.save((err, doc) => {
    if (err) return res.json({ success: false }, err);
    return res.status(200).json({ success: true, userData: doc });
  });
});

// II) login check eail->check passsword->generate token all functions defined in user.js
app.post("/api/users/login", (req, res) => {
  //check email
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "Auth failed, email not found",
      });

    // verify password
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "wrong password",
        });

      // generate token->creates a sign containing user._id and a secret private to the admin
      // and here it is passed as a cookie, named x_auth, to the client
      // this cookie is then checked in authentication done in middleware/auth.js
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        res.cookie("x_auth", user.token).status(200).json({
          loginSuccess: true,
        });
      });
    });
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  //here we just update user with an empty token
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, doc) => {
    if (err)
      return res.json({
        success: false,
        err,
      });
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(5000);
