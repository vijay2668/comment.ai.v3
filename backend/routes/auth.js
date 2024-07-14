const { Router } = require("express");
const { auth } = require("../controllers/auth");

const authRoutes = Router();

authRoutes.post("/auth", auth);

module.exports = { authRoutes };
