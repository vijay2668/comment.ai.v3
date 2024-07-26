const { Router } = require("express");
const {
  //  getRejectedComments,
  getComments
} = require("../controllers/comment");

const commentRoutes = Router();

// commentRoutes.post("/rejected-comments/:youtubeVideoId", getRejectedComments);
commentRoutes.post("/comments/:youtubeVideoId", getComments);

module.exports = { commentRoutes };
