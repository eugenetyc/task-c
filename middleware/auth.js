const jwt = require("jsonwebtoken");
const {
  AUTHENTICATE_ERR_CODE,
  AUTHORIZED_ERR_CODE,
} = require("../service/utility/responseHelper");
const { roles } = require("./roles");
const User = require("../model/user");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res
      .status(AUTHENTICATE_ERR_CODE)
      .send("You are missing the token required for authentication.");
  }

  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
    console.log("checks pass");
  } catch (err) {
    return res.status(AUTHENTICATE_ERR_CODE).send("Invalid Token");
  }

  return next();
};

const grantAccess = function (action, resource) {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(AUTHENTICATE_ERR_CODE).send("Invalid Token");
      }
      const permission = roles.can(user.role)[action](resource);
      if (!permission.granted) {
        return res.status(AUTHORIZED_ERR_CODE).json({
          error: "You don't have enough permission to perform this action",
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { verifyToken, grantAccess };
