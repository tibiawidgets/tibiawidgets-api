const { connectToDatabase } = require("../database/mongo");
const User = require("../models/User");

async function addClientOptions(req, res) {
  const { email } = req.user;
  await connectToDatabase();
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const userFilter = { email };
  const newClientOptions = {
    ...req.body,
  };
  const insertOptionsQuery = { $set: { clientOptions: newClientOptions } };
  await User.updateOne(userFilter, insertOptionsQuery);
  res.status(200).json({ message: "Client Options uploaded" });
}

async function deleteClientOptions(req, res) {
  const { email } = req.user;
  await connectToDatabase();
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const userFilter = { email };
  const insertOptionsQuery = { $set: { clientOptions: {} } };
  await User.updateOne(userFilter, insertOptionsQuery);
  res.status(200).json({ message: "Client Options deleted" });
}

module.exports = { addClientOptions, deleteClientOptions };
