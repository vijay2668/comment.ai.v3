const { Router } = require("express");
const { createSentiment, getSentiment } = require("../controllers/sentiment");

const sentimentRoutes = Router();

sentimentRoutes.post("/sentiment/:videoId", createSentiment);
sentimentRoutes.get("/sentiment/:videoId", getSentiment);

module.exports = { sentimentRoutes };
