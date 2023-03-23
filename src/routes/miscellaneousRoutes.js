const express = require("express");
const miscellaneousController = require("../controllers/miscellaneousController");

const router = express.Router();

router.get("/event-schedule", miscellaneousController.getEventSchedule);

module.exports = router;
