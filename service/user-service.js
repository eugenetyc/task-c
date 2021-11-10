const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model/user");

const DEFAULT_TOKEN_EXPIRE_TIME = 60;

/*
Register a new user, ensuring that all fields are present and the user does not currently exist via unique email
*/
const register = async (req, res) => {
  try {
    // ensure all required fields are present
    const { first_name, last_name, email, password } = req.body;
    if (!(email && password && first_name && last_name)) {
      res
        .status(400)
        .send("Please enter email, password, and your first and last names");
    }

    // reject if user exists already
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    // accept if new user
    encryptedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      first_name,
      last_name,
      email: email,
      password: encryptedPassword,
    });
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: `${DEFAULT_TOKEN_EXPIRE_TIME}s`,
      }
    );
    user.token = token;

    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
};

const login = async (req, res) => {
  try {
    // check all required fields exist
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send("Please enter both email and password");
    }

    // check user exists and password correct
    const user = await User.findOne({ email });
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
      res.status(200).json(user);
    }

    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
};

module.exports = { register, login };
