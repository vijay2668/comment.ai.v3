const { Router } = require("express");
const { getSimplified } = require("../controllers/simplified");

const simplifiedRoutes = Router();

simplifiedRoutes.post("/simplified", getSimplified);

module.exports = { simplifiedRoutes };
