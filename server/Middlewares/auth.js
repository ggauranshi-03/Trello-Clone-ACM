const db = require("../database.js");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        message: "Please login first!",
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;

    const query = `SELECT * FROM user WHERE email = ?`;

    db.query(query, [decoded.email], (error, result) => {
      if (error) {
        throw error;
      } else if (result.lenght == 0) {
        return res.status(400).json({ message: "Invalid Token!" });
      } else {
        req.user = result[0];

        next();
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
