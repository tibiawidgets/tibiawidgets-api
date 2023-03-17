const express = require("express");
const router = express.Router();
const { requireAuth } = require("../controllers/authController");
const {
  getCharacterHunts,
  addCharacterHunts,
  deleteCharacterHuntById,
} = require("../controllers/huntSessionController");

router.get(
  "/user/characters/:characterId/hunts",
  requireAuth,
  getCharacterHunts
);

router.post(
  "/user/characters/:characterId/hunts",
  requireAuth,
  addCharacterHunts
);

router.delete(
  "/user/characters/:characterId/hunts/:huntId",
  requireAuth,
  deleteCharacterHuntById
);

module.exports = router;
