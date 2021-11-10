require("dotenv").config();
require("./config/database").connect();
const express = require("express");

const app = express();
app.use(express.json());

const auth = require("./middleware/auth");
const { register, login } = require("./service/user-service");

// user management
app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome back!");
});
app.post("/register", register);
app.post("/login", login);

module.exports = app;
