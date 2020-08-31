const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    user: {
      //user info
      type: Array,
      default: [],
    },
    data: {
      //paypal info
      type: Array,
      default: [],
    },
    product: {
      // product purchased info
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
