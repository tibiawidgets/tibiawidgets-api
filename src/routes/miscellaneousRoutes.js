const express = require("express");
const miscellaneousController = require("../controllers/miscellaneousController");

const router = express.Router();

router.get("/misc/boosterBoss", miscellaneousController.getBoostedBoss);
router.get("/misc/boostedMonster", miscellaneousController.getBoostedMonster);
router.get("/misc/rashidLocation", miscellaneousController.getRashidLocation);
router.get("/misc/worlds", miscellaneousController.getWorlds);

module.exports = router;
