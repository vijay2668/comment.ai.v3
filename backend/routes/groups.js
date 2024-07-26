const { Router } = require("express");
const { getGroups } = require("../controllers/groups");

const groupsRoutes = Router();

groupsRoutes.post("/groups", getGroups);

module.exports = { groupsRoutes };
