const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxLength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  cart: {
    type: Array,
    default: [],
  },
  history: {
    type: Array,
    default: [],
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

// before saving the user this hashing of the password takes place
userSchema.pre("save", function (next) {
  var user = this; //this here is userSchema
  var password = user.password;

  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(password, salt, function (err, hash) {
        if (err) return next(err);

        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// compare passswords using bcrypt since they are stored in db as hashed strings
userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch); //callback->cb null->no error is passed
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), "secret");
  user.token = token;
  user.save((err, user) => {
    if (err) return cb(err);
    cb(null, user);
  });
};

// verify/authenticate whether the token at clients site is alid or not by using jwt verify
// token on the clients side is passed with the private secret  and resultant is a decoded token
// token was encoded with the useer._id and secret which is decoded in to user._id and secret
// and then we find a user in database with that _id and if found then authentication is completed
userSchema.statics.findByToken = function (token, cb) {
  var user = this;
  jwt.verify(token, "secret", (err, decode) => {
    //we will get user._id in decode after we do this if present
    user.findOne({ _id: decode, token: token }, (err, user) => {
      if (err) return cb(err);
      cb(null, user); //the user found here is send to auth.js
    });
  });
};

// const User = mongoose.model("User", userSchema);
// module.export = { User };

module.exports = mongoose.model("User", userSchema);
