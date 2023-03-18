const db = require("../database.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// exports.home = async (req, res) => {
//   try {
//     db.query(`SELECT * FROM dashboardusers`, (error, results) => {
//       if (error) {
//         throw error;
//       } else {
//         res.status(200).json({
//           success: true,
//           results,
//         });
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

exports.register = async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      `SELECT name FROM user WHERE email = ? `,
      [email],
      (error, results) => {
        if (error) {
          throw error;
        } else if (results.length !== 0) {
          res.status(400).json({
            success: false,
            message: "User already exists",
          });
        } else {
          db.query(
            `INSERT INTO user (name, surname, email, password) VALUES (?, ?, ?, ?)`,
            [name, surname, email, hashed],
            (error) => {
              if (error) {
                throw error;
              } else {
                const user = { email: email };
                const token = generateToken(user);

                const options = {
                  expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                  httpOnly: true,
                };

                res.status(200).cookie("token", token, options).json({
                  success: true,
                  user,
                  token,
                });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    db.query(`SELECT * FROM user WHERE email = ?`, [email], (error, result) => {
      if (error) {
        throw error;
      } else if (result.length == 0) {
        res.status(400).json({
          success: false,
          message: "User doesn't exist",
        });
      } else {
        bcrypt.compare(password, result[0].password, (error, isMatch) => {
          if (isMatch == true) {
            const user = { email: result[0].email };
            const token = generateToken(user);

            const options = {
              expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              httpOnly: true,
            };

            res.status(200).cookie("token", token, options).json({
              success: true,
              result,
              token,
            });
          } else if (isMatch == false) {
            return res.status(401).json({
              success: false,
              message: "Please enter correct password",
            });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

function generateToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}

exports.getUser = (req, res) => {
  try {
    const user = req.user;
    db.query(`SELECT * FROM user WHERE id = ?`, [user.id], (error, result) => {
      if (error) {
        throw error;
      } else if (result.length == 0) {
        return res.status(404).json({
          success: false,
          message: "user not found",
        });
      } else {
        return res.status(200).json({
          success: true,
          result,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserWithEmail = async (req, res) => {
  try {
    const email = req.body.email;

    db.query(`SELECT * FROM user WHERE email = ?`, [email], (error, result) => {
      if (error) {
        throw error;
      } else if (result.length == 0) {
        return res.status(404).json({
          success: false,
          message: "user not found",
        });
      } else {
        const dataTransferObject = {
          name: result[0].name,
          surname: result[0].surname,
          color: result[0].color,
          email: result[0].email,
        };
        return res.status(200).json({
          success: true,
          user: dataTransferObject,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
