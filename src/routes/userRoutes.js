const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.put("/user", userController.updateUserById);
router.get("/user", userController.deleteUserById);

router.post("/login", userController.login);
router.post("/verify-code", userController.verifyCode);

module.exports = router;
