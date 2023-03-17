const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUserById);
router.delete("/:id", userController.deleteUserById);

router.post("/login", userController.login);
router.post("/verify-code", userController.verifyCode);

module.exports = router;
