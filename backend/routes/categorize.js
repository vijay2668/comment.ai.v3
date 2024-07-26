const { Router } = require("express");
const { generateSentiment } = require("../controllers/categorize");

const categorizeRoutes = Router();

categorizeRoutes.post("/categorize", generateSentiment);

module.exports = { categorizeRoutes };
