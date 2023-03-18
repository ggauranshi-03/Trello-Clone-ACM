const express = require("express");
const {
  register,
  login,
  getUser,
  getUserWithEmail,
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../middlewares/Auth");

const router = express.Router();

// router.route("/").get(home);

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/getUser").get(isAuthenticated, getUser);

router.route("/getUserWithEmail").post(isAuthenticated, getUserWithEmail);

module.exports = router;
