const { Router } = require("express");
const { channel } = require("../controllers/channel");

const channelRoutes = Router();

channelRoutes.get("/channel/:channelId", channel);

module.exports = { channelRoutes };
