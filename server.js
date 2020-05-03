const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
const path = require("path");

const PORT = 3000;
const URL = process.env.MONGODB_URI || "mongodb://localhost/";

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(URL + "heroku_jx2x0c6q", {
  useNewUrlParser: true,
  useFindAndModify: false
});

// routes
app.use(require("./routes/api.js"));
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./public/index.html"));
})

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});