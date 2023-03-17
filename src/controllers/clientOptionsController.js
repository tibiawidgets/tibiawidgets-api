const { connectToDatabase } = require("../database/mongo");

async function addClientOptions(req, res) {
  const { email } = req.user;
  const db = await connectToDatabase();
  const userCollection = db.collection("users");
  let user = await userCollection.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const userFilter = { email };
  const newClientOptions = {
    ...req.body,
  };
  const insertOptionsQuery = { $set: { clientOptions: newClientOptions } };
  await userCollection.updateOne(userFilter, insertOptionsQuery);
  res.status(200).json({ message: "Client Options uploaded" });
}

async function deleteClientOptions(req, res) {
  const { email } = req.user;
  const db = await connectToDatabase();
  const userCollection = db.collection("users");
  let user = await userCollection.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const userFilter = { email };
  const insertOptionsQuery = { $set: { clientOptions: {} } };
  await userCollection.updateOne(userFilter, insertOptionsQuery);
  res.status(200).json({ message: "Client Options deleted" });
}

module.exports = { addClientOptions, deleteClientOptions };
