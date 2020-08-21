const User = require("../models/user");

let auth = (req, res, next) => {
  let token = req.cookies.x_auth;
//findbytoken is defined in models/user.js
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.json({
        isAuth: false,
        error: true,
      });

    req.token = token;
    req.user = user; //user came from user.js finByToken callback
    next();
  });
};

module.exports = auth;
