const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const auth = require("../middleware/auth");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  }, //uploads will be the folder in the project where all these files will be stored
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }, //name of the file will be DDMMYYYY_<filename>.jpg||.png
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" || ext !== ".png") {
      return cb(res.status(400).end("only jpg, png are allowed"), false);
    } //files with extension .jpg and .png will be accepted
    cb(null, true);
  },
});

var upload = multer({ storage: storage }).single("file");

router.post("/uploadImage", auth, (req, res) => {
  // after getting the image form the cloent we need to
  // send the image to server
  // for that we use multer library
  upload(req, res, (err) => {
    if (err)
      return res.json({
        success: false,
        err,
      });
    return res.json({
      success: true,
      image: res.req.file.path,
      fileName: res.req.file.filename,
    }); //this info will go to the frontend in the client/src/components/utils/FileUpload.js
  });
});

// save the products int the DB when submitted
router.post("/uploadProduct", auth, (req, res) => {
  // we need to save the data from the client to the DB
  const product = new Product(req.body);
  product.save((err) => {
    if (err) return res.status(400).json({ success: false });
    return res.status(200).json({ success: true });
  });
});

// getting the products loaded onto the landing page
router.post("/getProducts", (req, res) => {
  // cnoditions to fetch the products from the DB
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);

  // preparing findArgs object for price and continents filter
  let findArgs = {};
  let term = req.body.searchTerm;

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: req.body.filters[key][0], //greater than equal
          $lte: req.body.filters[key][1], //less than equal
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  // console.log(findArgs);//[0] { continents: [ 5, 4 ], price: { '$gte': 400, '$lte': 499 } }

  //here mongoDB will search suitable matches based on the consitions defined above

  if (term) {
    Product.find(findArgs)
      .find({ $text: { $search: term } }) // this handles the searchTerms and show products matchinng the searchTerms
      .populate("writer")
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec((err, products) => {
        if (err) return res.status(400).json({ success: false, err });
        return res
          .status(200)
          .json({ success: true, products, postSize: products.length });
      });
  } else {
    Product.find(findArgs)
      .populate("writer")
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec((err, products) => {
        if (err) return res.status(400).json({ success: false, err });
        return res
          .status(200)
          .json({ success: true, products, postSize: products.length });
      });
  }
});

// `api/product/products_by_id?id=${id}&type=single`
// type single since sending only one product id
// it'd have been type=array if lots of products have to be passed
router.get("/products_by_id", (req, res) => {
  let type = req.query.type;
  let productIds = req.query.id;

  // here is array of ids to b searched for
  if (type === "array") {
    let ids = req.query.id.split(",");
    productIds = [];
    productIds = ids.map((item) => {
      return item;
    });
  }
  // now we get info of the product that belong to product id

  // here is only single id search
  Product.find({ _id: { $in: productIds } })
    .populate("writer")
    .exec((err, product) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send(product);
    });
});

module.exports = router;
