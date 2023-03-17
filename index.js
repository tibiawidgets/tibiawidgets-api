const express = require("express");
const { connectToDatabase } = require("./src/database/mongo");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const { port } = require("./src/config/appConfig");
const { requireAuth } = require("./src/controllers/authController");
const userRoutes = require("./src/routes/userRoutes");
const characterRoutes = require("./src/routes/characterRoutes");

const app = express();

app.use(bodyParser.json());

// User endpoints
app.use(userRoutes);

/**
 * Ednpoints for characters
 */

app.use(characterRoutes);

/** Endpoints for character hunts */

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

// Define an authenticated route that requires a valid JWT token
app.get("/protected", requireAuth, function (req, res) {
  res.json({ message: "Protected route accessed" });
});

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
