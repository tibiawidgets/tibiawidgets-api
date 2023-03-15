const express = require("express");
const jwt = require("jsonwebtoken");
const { connectToDatabase } = require("./src/database/mongo");
const bodyParser = require("body-parser");
const generateCode = require("./src/utils/codeGenerator");
const sendEmail = require("./src/utils/mailSender");

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = "my-jwt-secret-key";
const bcrypt = require("bcrypt");

app.use(bodyParser.json());

// Define login route that checks user credentials and generates a JWT token
app.post("/login", async function (req, res) {
  const { email } = req.body;

  // Find the user in the database by email
  const db = await connectToDatabase();
  const collection = db.collection("users");
  const user = await collection.find({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
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
  res.json({ message: "Checa tu email" });
});

// Define a middleware function that checks for a valid JWT token
function requireAuth(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header required" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  // Verify the token and attach the user object to the request
  try {
    const user = jwt.verify(token, jwtSecret);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Define an authenticated route that requires a valid JWT token
app.get("/protected", requireAuth, function (req, res) {
  res.json({ message: "Protected route accessed" });
});

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
