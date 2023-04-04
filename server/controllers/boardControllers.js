const db = require("../database.js");

exports.create = async (req, res) => {
  try {
    const { title, backgroundImageLink } = req.body;
    if (!title && backgroundImageLink) {
      return res.status(400).json({
        success: false,
        message: "Cannot have Title or Background Image as null",
      });
    }
    db.query(
      `INSERT INTO board (title, backgroundImageLink) VALUES (?, ?)`,
      [title, backgroundImageLink],
      (error, result) => {
        if (error) {
          throw error;
        } else {
          db.query(
            `SELECT LAST_INSERT_ID() as new_board_id`,
            (error, result) => {
              if (error) {
                throw error;
              } else {
                const newBoardId = result[0].new_board_id;

                db.query(
                  `SELECT * FROM user WHERE id = ?`,
                  [req.user.id],
                  (error, result) => {
                    if (error) {
                      throw error;
                    } else {
                      const user = result[0];
                      const userBoards = JSON.parse(user.boards || "[]");
                      userBoards.unshift(newBoardId);
                      db.query(
                        `UPDATE user SET boards = ? WHERE id = ?`,
                        [JSON.stringify(userBoards), req.user.id],
                        (error, result) => {
                          if (error) {
                            throw error;
                          } else {
                            //Add user to the members of this board
                            const allMembers = [];
                            const owner = {
                              id: req.user.id,
                              name: req.user.name,
                              surname: req.user.surname,
                              email: req.user.email,
                              color: req.user.color,
                              role: "owner",
                            };
                            allMembers.push(owner);

                            db.query(
                              `UPDATE board SET members = ? WHERE id = ?`,
                              [JSON.stringify(allMembers), newBoardId],
                              (error, result) => {
                                if (error) {
                                  throw error;
                                } else {
                                  res.status(201).json({
                                    success: true,
                                    message: "Board Created",
                                  });
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

// exports.getAll = async (req, res) => {
//   try {
//     const id = req.user.id;
//     db.query(`select boards from user WHERE id = ?`, [id], (error, result) => {
//       if (error) {
//         throw error;
//       } else {
//         const boards = JSON.parse(result[0].boards); // parse the JSON string into an array
//         return res.status(200).json({ success: true, result: boards }); // return the array of boards
//         // return res.status(200).json({ success: true, result });
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.getAll = async (req, res) => {
//   try {
//     const email = req.user.email;
//     db.query(
//       `
//       SELECT board.id, board.title, board.backgroundImageLink
//       FROM user
//       JOIN board ON user.id = board.id
//       WHERE user.email = ?
//     `,
//       [email],
//       (error, result) => {
//         if (error) {
//           throw error;
//         } else {
//           return res.status(200).json({ success: true, result });
//         }
//       }
//     );
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

exports.getAll = async (req, res) => {
  try {
    const id = req.user.id;
    db.query(
      `SELECT boards FROM user WHERE id = ?`,
      [id],
      async (error, result) => {
        if (error) {
          throw error;
        } else {
          const boardIds = JSON.parse(result[0].boards || "[]");

          const boards = await Promise.all(
            boardIds.map(async (boardId) => {
              return new Promise((resolve, reject) => {
                db.query(
                  `SELECT * FROM board WHERE id = ?`,
                  [boardId],
                  (error, result) => {
                    if (error) {
                      reject(error);
                    } else {
                      resolve(result[0]);
                    }
                  }
                );
              });
            })
          );
          res.status(200).json({ success: true, boards });
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

exports.getById = async (req, res) => {
  try {
    const validate = req.user.boards.filter((board) => board === req.params.id);
    if (!validate)
      return res.status(400).send({
        success: false,
        Message:
          "You can not show the this board, you are not a member or owner!",
      });

    db.query(`select * from board where id = ?`, [id], (error, result) => {
      if (error) {
        throw error;
      } else {
        if (result.length === 0) {
          // If no matching row found
          return res.status(404).json({
            success: false,
            message: `Board with id ${id} not found`,
          });
        } else {
          // If a matching row found
          return res.status(200).json({ success: true, result });
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
