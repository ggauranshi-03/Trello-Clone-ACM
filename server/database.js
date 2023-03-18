const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect(function (err) {
  if (err) {
    console.log("error:" + err.stack);
  } else {
    console.log("Database Connected  ♡");
  }
});

module.exports = connection;
