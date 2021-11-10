require("dotenv").config();
require("./config/database").connect();
const express = require("express");

const app = express();
app.use(express.json());

const { verifyToken, grantAccess } = require("./middleware/auth");
const {
  register,
  login,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("./service/user-service");

// user management
app.post("/welcome", verifyToken, (req, res) => {
  res.status(200).send("Welcome back!");
});
app.post("/register", register);
app.post("/login", login);

// application management
// basic
app.post(
  "/user/specific",
  verifyToken,
  grantAccess("readOwn", "profile"),
  getUser
);
// premium
app.get("/user", verifyToken, grantAccess("readAny", "profile"), getUsers);
app.put("/user", verifyToken, grantAccess("updateAny", "profile"), updateUser);
app.delete(
  "/user/",
  verifyToken,
  grantAccess("deleteAny", "profile"),
  deleteUser
);

module.exports = app;
