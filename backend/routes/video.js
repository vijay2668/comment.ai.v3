const { Router } = require("express");
const { createVideoSession, getVideoSession } = require("../controllers/video");

const videoRoutes = Router();

videoRoutes.post("/video/:youtubeVideoId", createVideoSession);
videoRoutes.get("/video/:youtubeVideoId", getVideoSession);

module.exports = { videoRoutes };
