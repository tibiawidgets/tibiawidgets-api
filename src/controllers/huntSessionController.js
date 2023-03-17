const { connectToDatabase } = require("../database/mongo");
const uuid = require("uuid");

async function getCharacterHunts(req, res) {
  const authUser = req.user;
  const { characterId } = req.params;
  const db = await connectToDatabase();
  const usersCollection = db.collection("users");
  const filterByEmail = { email: authUser.email };
  const user = await usersCollection.findOne(filterByEmail);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const character = user.characters.find(
    (character) => character.id === characterId
  );
  if (!character) {
    return res.status(404).json({ message: "Character not found" });
  }

  res.status(200).json({
    huntSessions: character.huntSessions,
  });
}

async function addCharacterHunts(req, res) {
  const authUser = req.user;
  const { characterId } = req.params;
  const { huntSessions } = req.body;
  const filterByEmail = { email: authUser.email };
  if (!huntSessions || huntSessions.length === 0) {
    return res.status(404).json({ message: `No hunt sessions to add` });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne(filterByEmail);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const character = user.characters.find(
      (character) => character.id === characterId
    );
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    const newHuntSessions = huntSessions.map((session) => ({
      ...session,
      id: uuid.v4(),
    }));
    const patchCharFilter = { ...filterByEmail, "characters.id": characterId };
    const patchedCharHuntsQuery = {
      $push: { "characters.$.huntSessions": { $each: newHuntSessions } },
    };
    const result = usersCollection.updateOne(
      patchCharFilter,
      patchedCharHuntsQuery
    );

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
}

async function deleteCharacterHuntById(req, res) {
  const authUser = req.user;
  const { characterId, huntId } = req.params;
  const filterByEmail = { email: authUser.email };
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne(filterByEmail);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const character = user.characters.find(
      (character) => character.id === characterId
    );
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    const huntSession = character.huntSessions.find(
      (huntSession) => huntSession.id === huntId
    );

    if (!huntSession) {
      return res.status(404).json({ message: "Hunt session not found" });
    }

    const patchCharFilter = { ...filterByEmail, "characters.id": characterId };
    const patchedCharHuntsQuery = {
      $pull: { "characters.$.huntSessions": { id: huntId } },
    };
    const result = usersCollection.updateOne(
      patchCharFilter,
      patchedCharHuntsQuery
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: `Couldnt remove hunt session` });
    }

    res.status(200).json({
      message: `Hunt session ${huntId} of character ${character.name} was deleted`,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Ocurrio un error al agregar las hunt sessions" });
  }
}

module.exports = {
  getCharacterHunts,
  addCharacterHunts,
  deleteCharacterHuntById,
};
