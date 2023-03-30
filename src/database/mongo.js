const mongoose = require("mongoose");
const mongoUrl =
  "mongodb+srv://gbego91:mhjStMjwRyB1owMy@tibia-widgets.ri0t2zs.mongodb.net/tibia-widgets?retryWrites=true&w=majority";

async function connectToDatabase() {
  const client = await mongoose
    .connect(mongoUrl)
    .then(() => console.log("Database connected"));
  return client;
}

async function createUsersCollection(db) {
  const collection = await db.createCollection("users");
  collection.createIndex({ email: 1 }, { unique: true });
  return collection;
}

module.exports = { connectToDatabase, createUsersCollection };
