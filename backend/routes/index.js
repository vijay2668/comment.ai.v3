const { Router } = require("express");
const { authRoutes } = require("./auth");

const rootRouter = Router();

rootRouter.use("/auth", authRoutes);

module.exports = { rootRouter };
