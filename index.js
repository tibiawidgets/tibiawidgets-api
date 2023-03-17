const express = require("express");
const { connectToDatabase } = require("./src/database/mongo");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const { port } = require("./src/config/appConfig");
const { requireAuth } = require("./src/controllers/authController");
const userRoutes = require("./src/routes/userRoutes");
const characterRoutes = require("./src/routes/characterRoutes");
const huntsRoutes = require("./src/routes/huntSessionRoutes");

const app = express();

app.use(bodyParser.json());

// User endpoints
app.use(userRoutes);

/**
 * Ednpoints for characters
 */

app.use(characterRoutes);

/** Endpoints for character hunts */
app.use(huntsRoutes);

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
