const express = require("express");
const { create } = require("../controllers/cardControllers");

const { isAuthenticated } = require("../middlewares/Auth");

const router = express.Router();

router.route("/create").post(isAuthenticated, create);

module.exports = router;
