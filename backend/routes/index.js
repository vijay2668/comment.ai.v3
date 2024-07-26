const { Router } = require("express");
const { authRoutes } = require("./auth");
const { channelRoutes } = require("./channel");
const { videoRoutes } = require("./video");
const { sentimentRoutes } = require("./sentiment");
const { groupificationRoutes } = require("./groupification");
const { commentRoutes } = require("./comment");
const { categorizeRoutes } = require("./categorize");
const { simplifiedRoutes } = require("./simplified");
const { groupsRoutes } = require("./groups");

const rootRouter = Router();

rootRouter.use("/", authRoutes);
rootRouter.use("/", channelRoutes);
rootRouter.use("/", videoRoutes);
rootRouter.use("/", sentimentRoutes);
rootRouter.use("/", groupificationRoutes);
rootRouter.use("/", commentRoutes);
rootRouter.use("/", categorizeRoutes);
rootRouter.use("/", simplifiedRoutes);
rootRouter.use("/", groupsRoutes);

module.exports = { rootRouter };
