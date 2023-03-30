const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const passport = require("passport");

router.put("/user", userController.updateUserById);
router.get("/user", userController.getUserByEmail);

router.post("/login", userController.login);
router.post("/signin", userController.signin);
router.get("/logout", userController.logout);
router.get("/test", userController.test);
router.post("/verify-code", userController.verifyCode);

module.exports = router;
