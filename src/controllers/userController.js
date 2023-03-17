const generateCode = require("../utils/codeGenerator");
const sendEmail = require("../utils/mailSender");
const { connectToDatabase } = require("../database/mongo");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/appConfig");

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
  };
  const options = { expiresIn: "1h" };
  return jwt.sign(payload, jwtSecret, options);
}

async function login(req, res) {
  const { email } = req.body;

  // Find the user in the database by email
  const db = await connectToDatabase();
  const userCollection = db.collection("users");
  let user = await userCollection.findOne({ email });
  if (!user) {
    const newUser = { email, characters: [] };
    user = await userCollection.insertOne(newUser);
  }
  const findCodeCriteria = {
    email,
    isValid: true,
  };
  const codesCollection = db.collection("codes");
  const existing = await codesCollection.find(findCodeCriteria);
  if (existing) {
    await codesCollection.updateOne(findCodeCriteria, {
      $set: { isValid: false },
    });
  }

  const expiricy = 30 * 60 * 1000;
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + expiricy);
  const code = generateCode();
  const codeData = {
    email,
    code,
    created_at: createdAt.toUTCString(),
    expires_at: expiresAt.toUTCString(),
    isValid: true,
  };

  await codesCollection.insertOne(codeData);

  sendEmail(email, "Your TibiaWidgets Login Code", code);
  console.log(code);
  res.json({
    message:
      "An email with a code has been sent to you. Use this code to validate your identity. It will expire in 30 minutes.",
  });
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

async function updateUserById(req, res) {}
async function deleteUserById(req, res) {}

module.exports = {
  login,
  verifyCode,
  updateUserById,
  deleteUserById,
};
