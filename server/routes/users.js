const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const auth = require("../middleware/auth");
const async = require("async");

// III) get authenticated by getting checked if the token is there or not which was generated
router.get("/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
    cart: req.user.cart,
    history: req.user.history,
  });
});

//I) user registers here with details
router.post("/register", (req, res) => {
  const user = new User(req.body);
  //   user
  //     .save()
  //     .then(() => res.status(200).json(`User '${req.body.name}' added!`))
  //     .catch((err) => res.status(400).json(`Unable to add user. Error: ${err}.`));

  //before saving the user we hash the password in models/user.js
  user.save((err, doc) => {
    if (err) return res.json({ success: false }, err);
    return res.status(200).json({ success: true });
  });
});

// II) login check eail->check passsword->generate token all functions defined in user.js
router.post("/login", (req, res) => {
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
          userId: user._id,
        });
      });
    });
  });
});

router.get("/logout", auth, (req, res) => {
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

router.get("/addToCart", auth, (req, res) => {
  User.find({ _id: req.user._id }, (err, userInfo) => {
    let duplicate = false; //this boolean value is true when there is already a product with the same id in the cart

    let userCart = userInfo[0].cart;

    userCart.forEach((item) => {
      if (item.id == req.query.productId) {
        duplicate = true;
      }
    });

    if (duplicate) {
      User.findOneAndUpdate(
        { _id: req.user._id, "cart.id": req.query.productId },
        { $inc: { "cart.$.quantity": 1 } },
        { new: true }, //true because we will return the document after the change was supplied
        (err, userInfo) => {
          if (err) return res.json({ success: false, err });
          res.status(200).json(userInfo.cart);
        }
      );
    } else {
      User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $push: {
            cart: {
              id: req.query.productId,
              quantity: 1,
              date: Date.now(),
            },
          },
        },
        { new: true },
        (err, userInfo) => {
          if (err) return res.json({ success: false, err });
          res.status(200).json(userInfo.cart);
        }
      );
    }
  });
});

router.get("/removeFromCart", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    {
      $pull: { cart: { id: req.query._id } },
    },
    { new: true },
    (err, userInfo) => {
      let cart = userInfo.cart;
      let array = cart.map((item) => {
        return item.id;
      });

      Product.find({ _id: { $in: array } })
        .populate("writer")
        .exec((err, cartDetail) => {
          return res.status(200).json({
            cartDetail,
            cart,
          });
        });
    }
  );
});

router.post("/successBuy", auth, (req, res) => {
  let history = [];
  let transactionData = {};

  // put the brief  payment info in user collection
  req.body.cartDetail.forEach((item) => {
    history.push({
      dateOfPurchase: Date.now(),
      name: item.title,
      id: item._id,
      price: item.price,
      quantity: item.quantity,
      paymentId: req.body.paymentData.paymentID,
    });
  });

  // put payment info that come from paypal into payment collection
  transactionData.user = {
    id: req.user._id,
    name: req.user.name,
    lastname: req.user.lastname,
    email: req.user.email,
  };

  transactionData.data = req.body.paymentData;
  transactionData.product = history;

  User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { history: history }, $set: { cart: [] } },
    { new: true },
    (err, user) => {
      if (err) return res.json({ success: false, err });

      const payment = new Payment(transactionData);
      payment.save((err, doc) => {
        if (err) return res.json({ success: false, err });

        // increase the number of sold info

        //first We need to know how many product were sold in this transaction for
        // each of products

        let products = [];
        doc.product.forEach((item) => {
          products.push({ id: item.id, quantity: item.quantity });
        });

        // first Item    quantity 2
        // second Item  quantity 3

        // when we need to just update for one item in the sold field in PRODUCT
        // we just have to use the Product.finOneAndUpdate and then inc for incrementing
        // but since now we have multiple products here whose solde count is to be updated
        // so here we use eachSeries here from async

        async.eachSeries(
          products,
          (item, callback) => {
            Product.update(
              { _id: item.id },
              {
                $inc: {
                  sold: item.quantity,
                },
              },
              { new: false },
              callback
            );
          },
          (err) => {
            if (err) return res.json({ success: false, err });
            res.status(200).json({
              success: true,
              cart: user.cart,
              cartDetail: [],
            });
          }
        );
      });
    }
  );
});

router.get("/getHistory", auth, (req, res) => {
  User.findOne({ _id: req.user._id }, (err, doc) => {
    let history = doc.history;
    if (err) return res.status(400).send(err);
    return res.status(200).json({ success: true, history });
  });
});

module.exports = router;
