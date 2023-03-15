const express = require("express");
const jwt = require("jsonwebtoken");
const { connectToDatabase } = require("./src/database/mongo");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = "my-jwt-secret-key";
const bcrypt = require("bcrypt");

app.use(bodyParser.json());

// Define login route that checks user credentials and generates a JWT token
app.post("/login", async function (req, res) {
  const { email, password } = req.body;

  // Find the user in the database by email
  const db = await connectToDatabase();
  const collection = db.collection("users");
  const user = await collection.find({ email });
  console.log(user);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Compare the input password with the hashed password in the database
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate a JWT token for the authenticated user
  const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });
  res.json({ token });
});

// Define register route that creates a new user in the database
app.post("/register", async function (req, res) {
  const { email, password } = req.body;

  // Hash the password before saving to the database
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user in the database
  const db = await connectToDatabase();
  const collection = db.collection("users");
  const result = await collection.insertOne({
    email,
    password: hashedPassword,
  });

  // Generate a JWT token for the newly registered user
  const token = jwt.sign({ id: result.insertedId }, jwtSecret, {
    expiresIn: "1h",
  });
  res.json({ token });
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
