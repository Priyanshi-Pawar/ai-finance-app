const express = require("express");
const router = express.Router();

const { generateInsight } = require("../controllers/aiController");
const { getAdvancedInsight } = require("../controllers/aiController");

router.get("/insight", generateInsight);
router.get("/advanced-insight", getAdvancedInsight);

module.exports = router;


