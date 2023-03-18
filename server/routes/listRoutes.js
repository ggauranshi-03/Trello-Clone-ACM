const express = require("express");
const { create, getAll } = require("../controllers/listControllers");

const { isAuthenticated } = require("../middlewares/Auth");

const router = express.Router();

router.route("/create").post(isAuthenticated, create);

router.route("/:id").get(isAuthenticated, getAll);

module.exports = router;
