const express = require("express");
const router = express.Router();
const clientOptionsController = require("../controllers/clientOptionsController");
const { requireAuth } = require("../controllers/authController");

router.post(
  "/user/clientOptions",
  requireAuth,
  clientOptionsController.addClientOptions
);

router.delete(
  "/user/clientOptions",
  requireAuth,
  clientOptionsController.deleteClientOptions
);

module.exports = router;
