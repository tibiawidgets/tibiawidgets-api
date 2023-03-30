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
    email: user.email,
  };
  const options = { expiresIn: "1h" };
  return jwt.sign(payload, jwtSecret, options);
}

async function login(req, res, next) {
  passport.authenticate("login", { passReqToCallback: true })(req, res, next);
}

async function signin(req, res, next) {
  passport.authenticate(
    "signin",
    { passReqToCallback: true, failureFlash },
    (err, user, response) => {
      if (err) {
        return res.status(401).json(response);
      }
      return res.json(user);
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
  const { email } = req.user;
  const db = await connectToDatabase();
  const userCollection = db.collection("users");
  const filterByEmail = { email };
  let user = await userCollection.findOne(filterByEmail);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ user });
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
