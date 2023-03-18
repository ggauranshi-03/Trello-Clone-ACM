const express = require("express");
const { create } = require("../controllers/boardControllers");
const { getAll } = require("../controllers/boardControllers");
const { getById } = require("../controllers/boardControllers");

const { isAuthenticated } = require("../middlewares/Auth");

const router = express.Router();

router.route("/create").post(isAuthenticated, create);
router.route("/").get(isAuthenticated, getAll);
router.route("/:id").get(isAuthenticated, getById);

module.exports = router;
