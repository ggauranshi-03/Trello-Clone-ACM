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
              const user = req.user;

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

    db.query(
      `INSERT INTO card (title, owner) VALUES (?, ?)`,
      [title, listId],
      (error, result) => {
        if (error) {
          throw error;
        } else {
          db.query(`SELECT LAST_INSERTid() as new_cardid`, (error, result) => {
            if (error) {
              throw error;
            } else {
              const newCardId = result[0].new_cardid;
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
                          db.query(
                            `SELECT * FROM card WHERE id = ?`,
                            [newCardId],
                            (error, result) => {
                              if (error) {
                                throw error;
                              } else {
                                res.status(201).json({
                                  success: true,
                                  result,
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

exports.getCard = async (req, res) => {
  try {
    const user = req.user;
    const { boardId, listId, cardId } = req.params;
    db.query(
      `SELECT * FROM board WHERE id = ?`,
      [boardId],
      async (error, board) => {
        if (error) {
          throw error;
        } else {
          db.query(
            `SELECT * FROM list WHERE id = ?`,
            [listId],
            async (error, list) => {
              if (error) {
                throw error;
              } else {
                db.query(
                  `SELECT * FROM card WHERE id = ?`,
                  [cardId],
                  async (error, card) => {
                    if (error) {
                      throw error;
                    } else {
                      // Validate owner
                      const validate = await helperMethods.validateCardOwners(
                        card[0],
                        list[0],
                        board[0],
                        user,
                        false
                      );
                      if (!validate) {
                        errMessage: "You dont have permission to update this card";
                      }

                      let returnObject = {
                        card: card,
                        listTitle: list[0].title,
                        listId: listId,
                        boardId: boardId,
                      };
                      res
                        .status(200)
                        .json({ success: true, result: returnObject });
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
