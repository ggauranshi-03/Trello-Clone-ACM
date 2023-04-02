const db = require("../database.js");
const helperMethods = require("./helperMethods");

exports.create = async (req, res) => {
  try {
    const { title, listId, boardId } = req.body;

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
              db.query(
                `SELECT * FROM user WHERE id = ?`,
                [req.user.id],
                (error, result) => {
                  if (error) {
                    throw error;
                  } else {
                    const user = result[0];
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
          }
        );
      }
    });

    db.query(
      `INSERT INTO card (title, owner) VALUES (?, ?)`,
      [title, listId],
      (error, result) => {
        if (error) {
          throw error;
        } else {
          db.query(
            `SELECT LAST_INSERT_ID() as new_card_id`,
            (error, result) => {
              if (error) {
                throw error;
              } else {
                const newCardId = result[0].new_card_id;
                db.query(
                  `SELECT * FROM list WHERE id = ?`,
                  [listId],
                  (error, result) => {
                    if (error) {
                      throw error;
                    } else {
                      const list = result[0];
                      const listCards = JSON.parse(list.cards || "[]");
                      listCards.unshift(newCardId);
                      db.query(
                        `UPDATE list SET cards = ? WHERE id = ?`,
                        [JSON.stringify(listCards), listId],
                        (error, result) => {
                          if (error) {
                            throw error;
                          } else {
                            res.status(201).json({
                              success: true,
                              message: "Created a card!",
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
      message: error.message,
    });
  }
};
