const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.put("/user/:id", userController.updateUserById);
router.delete("/user/:id", userController.deleteUserById);

router.post("/login", userController.login);
router.post("/verify-code", userController.verifyCode);

module.exports = router;
