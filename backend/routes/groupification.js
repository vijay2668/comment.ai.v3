const { Router } = require("express");
const {
  createGroupification,
  getGroupification
} = require("../controllers/groupification");

const groupificationRoutes = Router();

groupificationRoutes.post(
  "/groupification/:sentimentId/:sentimentKey",
  createGroupification
);
groupificationRoutes.get(
  "/groupification/:sentimentId/:sentimentKey",
  getGroupification
);

module.exports = { groupificationRoutes };
