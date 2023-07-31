const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("./models/userSchema");
const User = mongoose.model("User");
// require("./models/blogSchema")
// const Blog = mongoose.model("Blog")

module.exports = (req, res, next) => {
  let { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      message: "You have to pass token in headers!",
    });

  }
  let token = authorization.replace("Bearer ", "");
  jwt.verify(token, "shubhi12345", (err, payload) => {
    if (err) {
      return res.status(401).json({
        message: "provide token.",
      });
    }
    let { _id } = payload;
    User.findById(_id).then((response) => {
      req.user = response;

      next();
    });
  });

};