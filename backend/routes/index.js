const { Router } = require("express");
const { authRoutes } = require("./auth");

const rootRouter = Router();

rootRouter.use("/", authRoutes);

module.exports = { rootRouter };
