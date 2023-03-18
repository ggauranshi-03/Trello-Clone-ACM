const db = require("../database.js");

exports.create = async (req, res) => {
  try {
    const { title, boardId } = req.body;
    if (!(title && boardId))
      return res
        .status(400)
        .json({ success: false, Message: "Title cannot be empty" });

    // Validate whether boardId is in the user's boards or not
    // const validate = req.user.board.filter((board) => board === boardId);
    // if (!validate)
    //   return res.status(400).send({
    //     success: false,
    //     Message:
    //       "You can not add a list to the board, you are not a member or owner!",
    //   });
    db.query(
      `SELECT boards FROM user WHERE id = ?`,
      [req.user.id],
      (error, result) => {
        if (error) {
          throw error;
        } else {
          const boards = JSON.parse(result[0].boards);
          const validate = boards.filter((board) => board == boardId);
          if (!validate)
            return res.status(400).send({
              success: false,
              Message:
                "You can not add a list to the board, you are not a member or owner!",
            });
        }
      }
    );

    db.query(
      `INSERT INTO list (title, owner) VALUES (?, ?)`,
      [title, boardId],
      (error, result) => {
        if (error) {
          throw error;
        } else {
          db.query(
            `SELECT LAST_INSERT_ID() as new_list_id`,
            (error, result) => {
              if (error) {
                throw error;
              } else {
                const newListId = result[0].new_list_id;
                db.query(
                  `SELECT * FROM board WHERE id = ?`,
                  [boardId],
                  (error, result) => {
                    if (error) {
                      throw error;
                    } else {
                      const board = result[0];
                      const boardLists = JSON.parse(board.lists || "[]");
                      boardLists.unshift(newListId);
                      db.query(
                        `UPDATE board SET lists = ? where id = ?`,
                        [JSON.stringify(boardLists), boardId],
                        (error, result) => {
                          if (error) {
                            throw error;
                          } else {
                            res.status(201).json({
                              success: true,
                              message: "list created",
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const boardId = req.params.id;

    db.query(
      `SELECT boards FROM user where id = ?`,
      [req.user.id],
      (error, result) => {
        if (error) {
          throw error;
        } else {
          const boards = JSON.parse(result[0].boards);
          const validate = boards.filter((board) => board === boardId);
          if (!validate)
            return res.status(400).json({
              success: false,
              Message:
                "You cannot get lists, because you are not owner of this lists!",
            });
        }
      }
    );

    db.query(
      `SELECT * FROM list WHERE owner = ?`,
      [boardId],
      (error, result) => {
        if (error) {
          throw error;
        } else {
          res.status(200).json({
            success: true,
            result,
          });
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
