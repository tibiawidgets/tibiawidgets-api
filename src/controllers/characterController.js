const { connectToDatabase } = require("../database/mongo");
const uuid = require("uuid");

async function addUserCharacter(req, res) {
  const { email } = req.user;
  const { name, world, sex, vocation } = req.body;
  const db = await connectToDatabase();
  const userCollection = db.collection("users");
  let user = await userCollection.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const userFilter = { email };
  const newCharacter = {
    id: uuid.v4(),
    name,
    world,
    sex,
    vocation,
    huntSessions: [],
  };
  const insertChar = { $push: { characters: newCharacter } };
  await userCollection.updateOne(userFilter, insertChar);
  res.status(200).json(newCharacter);
}

async function getUserCharacters(req, res) {
  const { email } = req.user;
  const db = await connectToDatabase();
  const userCollection = db.collection("users");
  let user = await userCollection.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user.characters);
}

async function getUserCharacterById(req, res) {
  const { email } = req.user;
  const { characterId } = req.params;
  const db = await connectToDatabase();
  const userCollection = db.collection("users");
  const filterByEmail = { email };
  let user = await userCollection.findOne(filterByEmail);
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

async function updateUserCharacter(req, res) {}
async function deleteUserCharacter(req, res) {}

module.exports = {
  addUserCharacter,
  getUserCharacters,
  getUserCharacterById,
  updateUserCharacter,
  deleteUserCharacter,
};
