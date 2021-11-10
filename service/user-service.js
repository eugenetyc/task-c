const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model/user");
const {
  AUTHENTICATE_ERR_CODE,
  AUTHORIZED_ERR_CODE,
  BAD_REQ_ERR_CODE,
  CONFLICT_ERR_CODE,
  SUCCESS_CODE,
  OK_CODE,
  wrapSuccessResult,
  wrapFailResult,
} = require("../service/utility/responseHelper");

const DEFAULT_TOKEN_EXPIRE_TIME = 60000;

/*
Register a new user, ensuring that all fields are present and the user does not currently exist via unique email
*/
const register = async (req, res) => {
  try {
    // ensure all required fields are present
    const { first_name, last_name, email, password, role } = req.body;
    if (!(email && password && first_name && last_name)) {
      res
        .status(BAD_REQ_ERR_CODE)
        .send("Please enter email, password, and your first and last names");
    }

    // reject if user exists already
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res
        .status(CONFLICT_ERR_CODE)
        .send("User Already Exist. Please Login");
    }

    // accept if new user
    encryptedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      first_name,
      last_name,
      email: email,
      password: encryptedPassword,
      role,
    });
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: `${DEFAULT_TOKEN_EXPIRE_TIME}s`,
      }
    );
    user.token = token;

    return res.status(SUCCESS_CODE).json(user);
  } catch (err) {
    console.log(err);
  }
};

const login = async (req, res) => {
  try {
    // check all required fields exist
    const { email, password } = req.body;
    if (!(email && password)) {
      return res
        .status(BAD_REQ_ERR_CODE)
        .send("Please enter both email and password");
    }

    // check user exists and password correct
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(AUTHENTICATE_ERR_CODE).send("Invalid Credentials");
    }
    const passwordPasses = await bcrypt.compare(password, user.password);
    if (user && passwordPasses) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: `${DEFAULT_TOKEN_EXPIRE_TIME}s`,
        }
      );
      user.token = token;

      return res.status(OK_CODE).json(user);
    }

    return res.status(AUTHENTICATE_ERR_CODE).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
};

const getUsers = async (req, res) => {
  const users = await User.find({}, "role first_name last_name email");
  return wrapSuccessResult(res, "Obtained all users", users);
};

const getUser = async (req, res) => {
  try {
    if (!req.body.email) {
      throw new Error("Request missing required email");
    }

    const query = { email: req.body.email };
    const foundUser = await User.findOne(query);
    if (!foundUser) {
      throw new Error("A user with such an email does not exist");
    }

    return wrapSuccessResult(res, "User details found", foundUser);
  } catch (err) {
    return wrapFailResult(res, err.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const newUserValues = req.body;
    if (
      !newUserValues.email ||
      !newUserValues.password ||
      !newUserValues.role ||
      !newUserValues.first_name ||
      !newUserValues.last_name
    ) {
      throw new Error("Missing all fields required!");
    }
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    newUserValues.token = token;
    const userEmail = { email: newUserValues.email };
    await User.findOneAndUpdate(userEmail, newUserValues);
    const result = await User.find(userEmail);

    return wrapSuccessResult(res, "User updated", result);
  } catch (error) {
    return wrapFailResult(res, error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const userEmail = req.body.email;
    if (!userEmail) {
      throw new Error("Missing user email required!");
    }
    const result = await User.deleteMany({ email: userEmail });

    return wrapSuccessResult(res, "User has been deleted", result);
  } catch (error) {
    return wrapFailResult(res, error.message);
  }
};

module.exports = { register, login, getUser, getUsers, updateUser, deleteUser };
