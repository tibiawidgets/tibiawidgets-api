const generateCode = require("../utils/codeGenerator");
const sendEmail = require("../utils/mailSender");
const { connectToDatabase } = require("../database/mongo");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/appConfig");
const User = require("../models/User");
const passport = require("passport");

function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };
  const options = { expiresIn: "1h" };
  return jwt.sign(payload, jwtSecret, options);
}

async function login(req, res, next) {
  passport.authenticate("login", function callback(err, user, info, status) {
    if (err) {
      const { message, status } = err;
      return res.status(status).json({ message });
    }
    // authenticated, create token and send
    const token = generateToken(user);
    const bData = { username: user.username, email: user.email, id: user._id };
    return res.json({ user: bData, token });
  })(req, res, next);
}

async function signin(req, res, next) {
  return passport.authenticate(
    "signin",
    function callback(err, user, info, status) {
      if (err) {
        const { message } = err;
        return res.status(401).json({ message });
      }
      return res.json({ user });
    }
  )(req, res, next);
}

async function test(req, res) {
  const db = await connectToDatabase();
  const newUser = new User({
    name: "John Doe",
    email: "johndoe@example.com",
    password: "123456",
  });

  try {
    await newUser.save();
  } catch (e) {
    return res.status(404).json({ message: "Error on creating admin: ", e });
  }

  res.json({ message: "Admin created successfully" });
}

async function logout(req, res) {
  req.logout();
  res.json({ message: "logged out successfully" });
}

async function verifyCode(req, res) {
  const { code, email } = req.body;

  if (!code) {
    return res.status(401).json({ message: "Missing code" });
  }
  if (!email) {
    return res.status(401).json({ message: "Missing email" });
  }

  const findCodeCriteria = {
    email,
    code,
    isValid: true,
  };
  const db = await connectToDatabase();
  const usersCollection = db.collection("users");
  const codesCollection = db.collection("codes");
  const existing = await codesCollection.find(findCodeCriteria).toArray();
  const user = await usersCollection.findOne({ email });
  if (existing.length === 0 || !user) {
    return res.status(401).json({ message: "Invalid code or email" });
  }

  // generate token
  const userId = user._id;
  const token = generateToken({ id: userId, email });

  await codesCollection.updateOne(findCodeCriteria, {
    $set: { isValid: false },
  });

  res.status(200).json({
    token,
  });
}

async function getUserByEmail(req, res) {
  try {
    const { email } = req.user;
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function updateUserById(req, res) {}
async function deleteUserById(req, res) {}

module.exports = {
  login,
  signin,
  logout,
  verifyCode,
  updateUserById,
  deleteUserById,
  getUserByEmail,
  test,
};
