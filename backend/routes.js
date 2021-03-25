const pool = require("./db");
const bcrypt = require("bcryptjs");

module.exports = function routes(app, logger) {
  // GET /
  app.get("/", (_, res) => {
    res.status(200).send("Go to 0.0.0.0:3000.");
  });

  // Users POST /users
  app.post("/users", (req, res) => {
    // obtain a connection with server
    pool.getConnection((err, connection) => {
      if (err) {
        // if there is an error obtaining a connection
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        // if there is no error obtaining a connection
        const username = req.body.username;
        const password = req.body.password;
        const is_construction_firm = req.body.is_construction_firm;
        const saltRounds = 10;

        const error = (err) => {
          logger.error("Error adding new user: \n", err);
          res.status(400).send({
            success: false,
            msg: "There was an error creating your user.",
          });
        };

        bcrypt.genSalt(saltRounds, (err, salt) => {
          if (err) {
            error(err);
            return;
          }
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              error(err);
              return;
            }
            const sql =
              "INSERT INTO db.users (username, pass, is_construction_firm) VALUES(?, ?, ?)";
            connection.query(
              sql,
              [username, hash, is_construction_firm],
              (err) => {
                connection.release();
                if (err) {
                  error(err);
                }
                res.status(200).send();
              }
            );
          });
        });
      }
    });
  });

  // Users POST /login
  app.post("/login", (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        // if there is no issue obtaining a connection, execute query and release connection
        const username = req.body.username;
        var sql = "SELECT * FROM db.users WHERE username = ?";
        connection.query(sql, [username], (err, rows) => {
          if (err || !rows.length) {
            logger.error("Error while username salt: \n", err);
            res
              .status(400)
              .send({ success: false, msg: "Invalid username or password" });
          } else {
            const hash = rows[0]["pass"];
            const password = req.body.password;

            bcrypt.compare(password, hash, (err, result) => {
              if (result && !err) {
                sql =
                  "SELECT username, is_construction_firm FROM db.users WHERE username = ?";
                connection.query(sql, [username], (err, rows) => {
                  if (err) {
                    logger.error("Error retrieving information: \n", err);
                    res
                      .status(400)
                      .send(
                        "Error retrieving login information from database."
                      );
                  } else {
                    res.status(200).send({ success: true, msg: rows[0] });
                  }
                });
              } else {
                logger.error("Error no matching password: \n", err);
                res.status(400).send({
                  success: false,
                  msg: "Incorrect username or password",
                });
              }
            });
          }
        });
      }
    });
  });


  // Users POST /reviews/{userid}
  app.post("/reviews/:userid", (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        const userid = req.params.userid;

        // check if user is in database
        var sql = "SELECT COUNT(*) FROM db.users WHERE userid = ?";

        connection.query => (
          sql, [userid],
          (err, rows) => {
            connection.release();
            if (err) {
              logger.error("Error retrieving Database Information: \n", err);
              res.status(400).send({ success: false, msg: "Error retrieving Database Information" });
            }
            // throw error if user not found
            else if (rows[0] == 0) {
              logger.error("Error wrong user: \n", err);
              res.status(400).send({ success: false, msg: "Invalid UserId" });
            }
            else {
              const msg = req.body.msg;
              const stars = req.body.stars;

              // throw error if message or stars is invalid
              if (!msg) {
                logger.error("Error no message", err);
                res.status(400).send("Invalid Message");
              }
              if (!stars) {
                logger.error("Error wrong format for stars", err);
                res.status(400).send("Invalid Stars");
              }

              var sql = "INSERT INTO db.reviews (userid, mesg, stars) VALUES (?,?,?)";

              connection.query(
                sql,
                [userid, mesg, stars],
                (err) => {
                  connection.release();
                  if (err) {
                    logger.error("Error Inserting: \n", err);
                    res.status(400).send({ success: false, msg: "Error Inserting User, Message, and Stars" });
                  }
                  res.status(200).send();
                }
              );
            }
        });
      }
    });
  });

};
