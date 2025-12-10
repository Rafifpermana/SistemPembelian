const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");

router.get("/", adminController.viewDashboard);

router.post("/buy", adminController.processBuy);
router.post("/cancel/:id", adminController.processCancel);

module.exports = router;
