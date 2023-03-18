const db = require("../database.js");
const helperMethods = require("./helperMethods");

exports.create = async (req, res) => {
  try {
    const { title, listId, boardId } = req.body;
    const user = req.user;

    //Validate the inputs
    if (!(title && listId && boardId))
      return res.status(400).send({
        success: false,
        message:
          "The create operation could not be completed because there is missing information",
      });

    db.query(`SELECT * from list WHERE id = ?`, [listId], (error, result) => {
      if (error) {
        throw error;
      } else {
        const list = result[0];
        db.query(
          `SELECT * from board WHERE id = ?`,
          [boardId],
          (error, result) => {
            if (error) {
              throw error;
            } else {
              const board = result[0];
              const validate = helperMethods.validateCardOwners(
                null,
                list,
                board,
                user,
                true
              );
              if (!validate)
                return callback({
                  Message:
                    "You dont have permission to add card to this list or board",
                });
            }
          }
        );
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
