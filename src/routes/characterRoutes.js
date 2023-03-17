const express = require("express");
const router = express.Router();
const charController = require("../controllers/characterController");
const { requireAuth } = require("../controllers/authController");

router.post("/user/characters", requireAuth, charController.addUserCharacter);
router.get("/user/characters", requireAuth, charController.getUserCharacters);
router.get(
  "/user/characters/:characterId",
  requireAuth,
  charController.getUserCharacterById
);
router.put(
  "/user/characters/:characterId",
  requireAuth,
  charController.updateUserCharacter
);
router.delete(
  "/user/characters/:characterId",
  requireAuth,
  charController.deleteUserCharacter
);

module.exports = router;
