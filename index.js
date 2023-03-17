const express = require("express");
const jwt = require("jsonwebtoken");
const { connectToDatabase } = require("./src/database/mongo");
const bodyParser = require("body-parser");
const generateCode = require("./src/utils/codeGenerator");
const sendEmail = require("./src/utils/mailSender");
const uuid = require("uuid");

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = "my-jwt-secret-key";
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

app.use(bodyParser.json());

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
  };
  const options = { expiresIn: "1h" };
  return jwt.sign(payload, jwtSecret, options);
}

// Función que cifra la contraseña del usuario
function hashPassword(password) {
  const saltRounds = 10; // El número de rondas de cifrado
  return bcrypt.hash(password, saltRounds);
}

// Define login route that checks user credentials and generates a JWT token
app.post("/login", async function (req, res) {
  const { email } = req.body;

  // Find the user in the database by email
  const db = await connectToDatabase();
  const collection = db.collection("users");
  let user = await collection.findOne({ email });
  if (!user) {
    user = await collection.insertOne({ email });
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
  res.json({
    message:
      "An email with a code has been sent to you. Use this code to validate your identity. It will expire in 30 minutes.",
  });
});

app.post("/verify-code", async function (req, res) {
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
});

app.get("/user/hunts", requireAuth, async function (req, res) {
  const authUser = req.user;
  const db = await connectToDatabase();
  const usersCollection = db.collection("users");
  const user = await usersCollection.findOne({ email: authUser.email });

  res.status(200).json({
    huntSessions: user.huntSessions,
  });
});

app.post("/user/hunts/add", requireAuth, async function (req, res) {
  const authUser = req.user;
  const { huntSessions } = req.body;
  if (!huntSessions || huntSessions.length === 0) {
    return res.status(404).json({ message: `No hunt sessions to add` });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: authUser.email });

    if (!user.huntSessions) {
      await usersCollection.updateOne(
        { email: authUser.email },
        { $set: { huntSessions: [] } }
      );
    }

    const newHuntSessions = huntSessions.map((session) => ({
      ...session,
      id: uuid.v4(),
    }));
    const filter = { email: authUser.email };
    const update = { $push: { huntSessions: { $each: newHuntSessions } } };
    const result = await usersCollection.updateOne(filter, update);

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: `No se pudo agregar la hunt session` });
    }

    res.status(200).json({
      message: `${huntSessions.length} hunt sessions agregadas`,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Ocurrio un error al agregar las hunt sessions" });
  }
});

app.delete("/user/hunt/:huntId/delete", requireAuth, async function (req, res) {
  const huntId = req.params.huntId;
  const authUser = req.user;
  const db = await connectToDatabase();
  const usersCollection = db.collection("users");
  const filterByEmail = { email: authUser.email };
  const user = await usersCollection.findOne(filterByEmail);

  if (!user) {
    return res.status(404).json({ message: `User doesn't exist.` });
  }

  // Verificar si el ID de la hunt session que se desea eliminar existe en el array
  if (!user.huntSessions.some((huntSession) => huntSession.id === huntId)) {
    return res.status(404).json({ message: "Hunt session not found" });
  }

  const update = {
    $pull: { huntSessions: { id: huntId } },
  };

  const result = await usersCollection.updateOne(filterByEmail, update);

  if (result.modifiedCount === 0) {
    return res.status(500).json({ message: "Error eliminando hunt session" });
  }
  res
    .status(200)
    .json({ message: `Hunt session ${huntId} eliminada correctamente` });
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
