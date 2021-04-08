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
        const type = req.body.user_type;
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
              "INSERT INTO db.users (username, pass, user_type) VALUES(?, ?, ?)";
            connection.query(
              sql,
              [username, hash, type],
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
                  "SELECT username, user_type FROM db.users WHERE username = ?";
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

  // Products GET returns all prodcuts
  app.get("/products", (req, res) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        // if there is no issue obtaining a connection, execute query and release connection
        const sql = "SELECT * FROM products"
        connection.query(sql, (err, rows) => {
          if(err) {
            logger.error("Error retrieving products: \n", err);
            res.status(400).send({
              success: false,
              msg: "Error retrieving products"
            })
          } else {
            res.status(200).send({success: true, data: rows});
          }
        })
      }
    })
  })

  // Products POST create new product
  app.post("/product", (req, res) => {
    pool.getConnection(function(err, connection) {
      if(err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        // if there is no issue obtaining a connection, execute query and release connection
        const name = req.body.name;
        const sql = "INSERT INTO products (name) VALUES(?)";

        connection.query(sql, [name], (err, result) => {
          if(err) {
            logger.error("Error adding product: \n", err);
            res.status(400).send({success: false, msg: "Error adding product"})
          } else {
            res.status(200).send({success: true, msg: "Product successfully added"})
          }
        })
      }
    })
  })

  // POST /bulk
  app.post('/bulk', (req, res) => {
      pool.getConnection(function (err, connection) {
        if(err) {
          // if there is an issue obtaining a connection, release the connection instance and log the error
          logger.error("Problem obtaining MySQL connection", err);
          res.status(400).send("Problem obtaining MySQL connection");
        } else {
          // if there is no issue obtaining a connection, execute query and release connection
          jwt.verifyToken(req).then((user) => {
            const id = req.body.id;
            const product_id = req.body.product_id;
            const list_user_id = user.id;
            const is_finished = req.body.is_finished;
            const is_discounted = req.body.is_discounted;
            const quantity_left = req.body.quantity_left;
            const description = req.body.description;
            const base_price = req.body.base_price;


            const sql = "INSERT INTO bulk_listing (id, product_id, list_user_id, is_finished, is_discounted, description, quantity_left, base_price) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";

            connection.query(sql, [id, product_id, list_user_id, is_finished, is_discounted, description, quantity_left, base_price], (err, results) => {
              connection.release();
              if(err) {
                logger.error("Error adding bulk listing: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error adding bulk listing" });
              } else {
                res
                .status(200)
                .send({ success: true, msg: "Bulk listing successfully created" });
              }
            })
          }).catch(() => {
            res.status(400);
          })
        }
      })
  })

  // GET /bulk
  app.get('/bulk', (req, res) => {
    pool.getConnection(function (err, connection) {
      if(err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        // if there is no issue obtaining a connection, execute query and release connection
        const sql = "SELECT * FROM bulk_listing WHERE is_finished = 0";


        connection.query(sql, (err, rows) => {
          connection.release();
          if(err) {
            logger.error("Error getting bulk listings: \n", err);
            res
              .status(400)
              .send({ success: false, msg: "Error getting bulk listings" });
          } else {
            rows.forEach((row) => {
              row.current_price = getListingPrice(row.base_price, row.discount_price, row.discount_end)
            })
            res
              .status(200)
              .send({ success: true, data: rows })
          }
        })
      }
    })
  })

  // PUT /bulk/{id}
  app.put('/bulk/', (req, res) => {
    pool.getConnection(function (err, connection) {
      if(err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const user_id = user.id;
          const id = req.param('id');

          
          const auction = "SELECT description, discount_price, base_price, discount_end, quantity_left FROM bulk_listing WHERE list_user_id = ? AND id = ?";

          connection.query(auction, [user_id, id], (err, results) => {
            if(err) {
              logger.error("Error retrieving listing information: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error retrieving listing information" });
            } else {
              const description = req.body.description        || results[0].description;
              const discount_price = req.body.discount_price  || results[0].discount_price;
              const base_price = req.body.base_price          || results[0].base_price;
              const discount_end = req.body.discount_end      || results[0].discount_end;
              const quantity_left = req.body.quantity_left    || results[0].quantity_left;
              const sql = "UPDATE bulk_listing SET description = ?, discount_price = ?, base_price = ?, discount_end = ?, quantity_left = ? WHERE list_user_id = ? AND id = ?";

              connection.query(sql, [description, discount_price, base_price, discount_end, quantity_left, user_id, id], (error, result) => {
                connection.release();
                if(error) {
                  logger.error("Error updating bulk listing information: \n", err);
                  res
                    .status(400)
                    .send({ success: false, msg: "Error updating bulk listing information" });
                } else {
                  res
                    .status(200)
                    .send({ success: true, msg: "Bulk listing updated" })
                }
              })
            }
          })
        }).catch(() => {
          res.status(400).end();
        })
      }
    })
  })

  // DELETE /bulk/{id}
  app.delete('/bulk/', (req, res) => {
    pool.getConnection(function (err, connection) {
      if(err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const user_id = user.id;
          const sql = "DELETE FROM bulk_listing WHERE id = ? AND list_user_id = ?";

          connection.query(sql, [req.param('id'), user_id], (err, result) => {
            connection.release();
            if(err) {
              logger.error("Error deleting bulk listing: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error deleting listing" });
            } else {
              res
                .status(200)
                .send({ success: true, msg: "Listing deleted successfully" })
            }
          })
        }).catch(() => {
            res.status(400).end();
        })
      }
    })
  })

  // post /bulk/{id}
  app.post('/bulk/', (req, res) => {
    pool.getConnection(function (err, connection) {
      if(err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const user_id = user.id;
          const ask_quantity = req.body.ask_quantity;
          const sql = "UPDATE bulk_listing SET quantity_left = quantity_left - ? WHERE id = ? AND list_user_id = ? AND quantity_left >= ?";

          // TODO
          // Include script where if quantity left is <0 throw error

          connection.query(sql, [ask_quantity, req.param('id'), user_id, ask_quantity], (err, result) => {
            connection.release();
            if(err) {
              logger.error("Error updating bulk listing: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error updating listing" });
            } else {
              const sql = "SELECT quantity_left FROM bulk_listing WHERE id = ? AND list_user_id = ?";

              connection.query(sql, (err, rows) => {
                connection.release();
                if(err) {
                  logger.error("Error getting bulk listings: \n", err);
                  res
                    .status(400)
                    .send({ success: false, msg: "Error getting bulk listings" });
                } else {
                  rows.forEach((row) => {
                    if(row.quantity_left == 0){
                      const sql = "UPDATE bulk_listing SET quantity_left is_finished = true WHERE id = ? AND list_user_id = ?";

                      connection.query(sql, [ask_quantity, req.param('id'), user_id, ask_quantity], (err, result) => {
                        connection.release();
                        if(err) {
                          logger.error("Error updating bulk listing: \n", err);
                          res
                            .status(400)
                            .send({ success: false, msg: "Error updating listing" });
                        }
                    }
                  })
                  res
                    .status(200)
                    .send({ success: true, data: rows })
                }
              })
            }
          })
        }).catch(() => {
            res.status(400).end();
        })
      }
    })
  })

};

function getListingPrice(base_price, discount_price, discount_end) {
  var curr = new Date();
  var discount = new Date(discount_end);

  if(curr < discount) {
    return discount_price;
  } else if(curr > discount) {
    return base_price;
  }
}
