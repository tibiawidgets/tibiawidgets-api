const { connectToDatabase } = require("../database/mongo");
const uuid = require("uuid");
const User = require("../models/User");

async function addUserCharacter(req, res) {
  const { email } = req.user;
  const { name, world, gender, vocation } = req.body;
  await connectToDatabase();
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (user.characters.find((char) => char.name === name)) {
    return res.status(401).json({ message: "User already exists" });
  }
  const userFilter = { email };
  const newCharacter = {
    id: uuid.v4(),
    name,
    world,
    gender,
    vocation,
    huntSessions: [],
  };
  const insertChar = { $push: { characters: newCharacter } };
  await user.updateOne(userFilter, insertChar);
  res.status(200).json(newCharacter);
}

async function getUserCharacters(req, res) {
  const { email } = req.user;
  await connectToDatabase();
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user.characters);
}

async function getUserCharacterById(req, res) {
  const { email } = req.user;
  const { characterId } = req.params;
  await connectToDatabase();
  const filterByEmail = { email };
  let user = await User.findOne(filterByEmail);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Verificar si el name del char que se desea buscar existe en el array
  const character = user.characters.find(
    (character) => character.id === characterId
  );
  if (!character) {
    return res.status(404).json({ message: "Character not found" });
  }
  res.status(200).json(character);
}

async function updateUserCharacter(req, res) {
  const { email } = req.user;
  const { characterId } = req.params;
  await connectToDatabase();
  const filterByEmail = { email };
  let user = await User.findOne(filterByEmail);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Verificar si el name del char que se desea buscar existe en el array
  const character = user.characters.find(
    (character) => character.id === characterId
  );
  if (!character) {
    return res.status(404).json({ message: "Character not found" });
  }

  const patchCharFilter = { ...filterByEmail, "characters.id": characterId };
  const patchedChar = { ...character, ...req.body };
  const patchedCharQuery = { $set: { "characters.$": patchedChar } };
  const result = user.updateOne(patchCharFilter, patchedCharQuery);

  if (result.modifiedCount === 0) {
    return res.status(404).json({
      message: `An error ocurred while updating the character. Verify the ID and try again.`,
    });
  }
  res.status(200).json(patchedChar);
}
async function deleteUserCharacter(req, res) {
  const { email } = req.user;
  const { characterId } = req.params;
  const db = await connectToDatabase();
  const filterByEmail = { email };
  let user = await User.findOne(filterByEmail);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Verificar si el name del char que se desea buscar existe en el array
  const character = user.characters.find(
    (character) => character.id === characterId
  );
  if (!character) {
    return res.status(404).json({ message: "Character not found" });
  }

  const update = {
    $pull: { characters: { id: characterId } },
  };

  const result = await user.updateOne(filterByEmail, update);

  if (result.modifiedCount === 0) {
    return res.status(404).json({
      message: `An error ocurred while deleting the character. Verify the ID and try again.`,
    });
  }

  res.status(200).json({
    message: `Character ${character.name} with ID: ${characterId} deleted`,
  });
}

async function deleteAllUserCharacters(req, res) {
  const { email } = req.user;

  const db = await connectToDatabase();
  const filterByEmail = { email };
  let user = await User.findOne(filterByEmail);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const update = {
    $set: { characters: [] },
  };

  const result = await user.updateOne(filterByEmail, update);

  if (result.modifiedCount === 0) {
    return res.status(404).json({
      message: `Didnt find any characters`,
    });
  }

  res.status(200).json({
    message: `Deleted all chars from ${email}`,
  });
}

module.exports = {
  addUserCharacter,
  getUserCharacters,
  getUserCharacterById,
  updateUserCharacter,
  deleteUserCharacter,
  deleteAllUserCharacters,
};
