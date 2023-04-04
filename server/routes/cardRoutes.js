const express = require("express");
const { create, getCard } = require("../controllers/cardControllers");

const { isAuthenticated } = require("../middlewares/Auth");

const router = express.Router();

router.route("/create").post(isAuthenticated, create);
router.route("/:boardId/:listId/:cardId").get(isAuthenticated, getCard);

module.exports = router;
