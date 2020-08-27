const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = mongoose.Schema(
  {
    writer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      maxlength: 50,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
      default: [],
    },
    continents: {
      type: Number,
      default: 1,
    },
    sold: {
      type: Number,
      maxlength: 100,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// this is done so that we can search for the products and the
// results will match the search terms from name an description both
productSchema.index(
  {
    name: "text",
    description: "text",
  },
  {
    //These weights denote the relative significance of the indexed fields to each othe
    weights: {
      title: 5,
      description: 1,
    },
  }
);

module.exports = mongoose.model("Product", productSchema);
