const express = require("express");
const app = express();
const mongoose = require("mongoose");
// abc1234 <-password   jatin<-dbUser
mongoose
  .connect(
    "mongodb+srv://jatin:abc1234@cluster0.im5ic.mongodb.net/<dbname>?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true } //this removes duplication warning from mongoose
  )
  .then(() => console.log("DB connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(5000);
