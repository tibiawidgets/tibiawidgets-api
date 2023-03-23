const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAuth } = require("../controllers/authController");

router.put("/user", userController.updateUserById);
router.get("/user", requireAuth, userController.getUserByEmail);

router.post("/login", userController.login);
router.post("/verify-code", userController.verifyCode);

module.exports = router;
