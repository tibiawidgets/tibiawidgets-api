const { MongoClient } = require("mongodb");
const mongoUrl =
  "mongodb+srv://gbego91:mhjStMjwRyB1owMy@tibia-widgets.ri0t2zs.mongodb.net/?retryWrites=true&w=majority";

async function connectToDatabase() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  return client.db("tibia-widgets");
}

async function createUsersCollection(db) {
  const collection = await db.createCollection("users");
  collection.createIndex({ email: 1 }, { unique: true });
  return collection;
}

module.exports = { connectToDatabase, createUsersCollection };
