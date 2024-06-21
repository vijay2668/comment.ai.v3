const { Router } = require("express");
const { login } = require("../controllers/auth");

const authRoutes = Router();

authRoutes.post("/login", login);

module.exports = { authRoutes };