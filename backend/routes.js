const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("./jwt");

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
            connection.query(sql, [username, hash, type], (err, result) => {
              connection.release();
              if (err) {
                error(err);
                return;
              }
              const JWT = jwt.makeJWT(result.insertId);
              res.status(200).send({
                success: true,
                data: { jwt: JWT },
              });
            });
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
          connection.release();
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
                let { username, user_type } = rows[0];
                const JWT = jwt.makeJWT(rows[0].id);
                res.status(200).send({
                  success: true,
                  data: { jwt: JWT, username, user_type },
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

  app.get("/users/check", (req, res) => {
    jwt
      .verifyToken(req)
      .then((user) => {
        user = { username: user.username, user_type: user.user_type };
        res.status(200).send(user);
      })
      .catch(() => {
        res.status(400).end();
      });
  });

  // Products GET returns all prodcuts
  app.get("/products", (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        // if there is no issue obtaining a connection, execute query and release connection
        const sql = "SELECT * FROM products";
        connection.query(sql, (err, rows) => {
          connection.release();
          if (err) {
            logger.error("Error retrieving products: \n", err);
            res.status(400).send({
              success: false,
              msg: "Error retrieving products",
            });
          } else {
            res.status(200).send({ success: true, data: rows });
          }
        });
      }
    });
  });

  // Products POST create new product
  app.post("/product", (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        // if there is no issue obtaining a connection, execute query and release connection
        const name = req.body.name;
        const sql = "INSERT INTO products (name) VALUES(?)";

        connection.query(sql, [name], (err, result) => {
          connection.release();
          if (err) {
            logger.error("Error adding product: \n", err);
            res
              .status(400)
              .send({ success: false, msg: "Error adding product" });
          } else {
            res
              .status(200)
              .send({ success: true, msg: "Product successfully added" });
          }
        });
      }
    });
  });

  // POST /fixed (create a fixed auction)
  app.post('/fixed', (req, res) => {
      pool.getConnection(function (err, connection) {
        if(err) {
          // if there is an issue obtaining a connection, release the connection instance and log the error
          logger.error("Problem obtaining MySQL connection", err);
          res.status(400).send("Problem obtaining MySQL connection");
        } else {
          // if there is no issue obtaining a connection, execute query and release connection
          jwt.verifyToken(req).then((user) => {
            const product_id = req.body.product_id;
            const list_user_id = user.id;
            const is_finished = req.body.is_finished;
            const is_discounted = req.body.is_discounted;
            const description = req.body.description;
            const base_price = req.body.base_price;
            const quantity = req.body.quantity;
            const sql = "INSERT INTO fixed_price (product_id, list_user_id, is_finished, is_discounted, description, base_price, quantity) VALUES( ?, ?, ?, ?, ?, ?, ?)";

            connection.query(sql, [product_id, list_user_id, is_finished, is_discounted, description, base_price, quantity], (err, results) => {
              connection.release();
              if(err) {
                logger.error("Error adding fixed price auction: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error adding fixed price auction" });
              } else {
                res
                .status(200)
                .send({ success: true, msg: "Fixed price auction successfully created" });
              }
            })
          }).catch(() => {
            res.status(400);
          })
        }
      })
  })

  // GET /fixed (get all current fixed options)
  app.get('/fixed', (req, res) => {
    pool.getConnection(function (err, connection) {
      if(err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        // if there is no issue obtaining a connection, execute query and release connection
        const sql = "SELECT * FROM fixed_price WHERE is_finished = 0";
        connection.query(sql, (err, rows) => {
          connection.release();
          if(err) {
            logger.error("Error getting fixed price listings: \n", err);
            res
              .status(400)
              .send({ success: false, msg: "Error getting fixed price listings" });
          } else {
            rows.forEach((row) => {
              row.price_for_quantity = getListingPrice(row.base_price, row.discount_price, row.discount_end, row.quantity);
              row.single_price = getListingPrice(row.base_price, row.discount_price, row.discount_end, 1);
            })
            res
              .status(200)
              .send({ success: true, data: rows })
          }
        })
      }
    })
  })

  // PUT /fixed/{id} (update an auction with discount price, description, base price, discount end)
  app.put('/fixed/', (req, res) => {
    pool.getConnection(function (err, connection) {
      if(err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const user_id = user.id;
          const id = req.param('id');
          const auction = "SELECT description, discount_price, base_price, discount_end FROM fixed_price WHERE list_user_id = ? AND id = ?";

          connection.query(auction, [user_id, id], (err, results) => {
            if(err) {
              logger.error("Error retrieving auction information: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error retrieving auction information" });
            } else {
              const description = req.body.description || results[0].description;
              const discount_price = req.body.discount_price || results[0].discount_price;
              const base_price = req.body.base_price || results[0].base_price;
              const discount_end = req.body.discount_end || results[0].discount_end;
              const quantity = req.body.quantity || results[0].quantity;
              const sql = "UPDATE fixed_price SET description = ?, discount_price = ?, base_price = ?, discount_end = ? WHERE list_user_id = ? AND id = ?";

              connection.query(sql, [description, discount_price, base_price, discount_end, user_id, id], (error, result) => {
                connection.release();
                if(error) {
                  logger.error("Error updating auction information: \n", err);
                  res
                    .status(400)
                    .send({ success: false, msg: "Error updating auction information" });
                } else {
                  res
                    .status(200)
                    .send({ succes: true, msg: "Fixed price auction updated" })
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

  // DELETE /fixed/{id} (delete selected auction)
  app.delete('/fixed/', (req, res) => {
    pool.getConnection(function (err, connection) {
      if(err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const user_id = user.id;
          const sql = "DELETE FROM fixed_price WHERE id = ? AND list_user_id = ?";

          connection.query(sql, [req.param('id'), user_id], (err, result) => {
            connection.release();
            if(err) {
              logger.error("Error deleting fixed price auction: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error deleting auction" });
            } else {
              res
                .status(200)
                .send({ succes: true, msg: "Auction deleted successfully" })
            }
          })
        }).catch(() => {
            res.status(400).end();
        })
      }
    })
  })

  // POST /buy/{id} (user buys auction, update quantity or end listing and create transaction)
  app.post('/buy/', (req, res) => {
      pool.getConnection(function(err, connection) {
      if(err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        connection.beginTransaction(function () {
          const getAuction = "SELECT * FROM fixed_price WHERE id = ?";
          connection.query(getAuction, [req.param('id')], (err, auction) => {
            if (err) {
              connection.rollback(function () {
                logger.error("Error retrieving auction information: \n", err);
                res
                  .status(400)
                  .send({ success: false, msg: "Error retrieving auction information" });
              });
            } else {
              const purchase_quantity = req.body.purchase_quantity;
              if (purchase_quantity < auction[0].quantity) {
                const quantity_remaining = auction[0].quantity - purchase_quantity;
                const update = "UPDATE fixed_price SET quantity = ? WHERE id = ?";
                connection.query(update, [quantity_remaining, req.param('id')], (updateErr) => {
                  connection.commit();
                  connection.release();
                  if (err) {
                    logger.error("Error updating auction information: \n", err);
                    res
                      .status(400)
                      .send({ success: false, msg: "Error updating auction information" });
                  } else {
                    createTransaction(req, res, req.param('id'), 1, purchase_quantity, auction);
                  }
                });
              } else if (purchase_quantity == auction[0].quantity) {
                const update = "UPDATE fixed_price SET quantity = 0, is_finished = 1 WHERE id = ?";
                connection.query(update, [req.param('id')], (err) => {
                  connection.commit();
                  connection.release();
                  if (err) {
                    logger.error("Error updating auction information: \n", err);
                    res
                      .status(400)
                      .send({ success: false, msg: "Error updating auction information" });
                  } else {
                    const transactionID = req.body.id;
                    createTransaction(req, res, req.param('id'), 1, purchase_quantity, auction);
                  }
                });
              } else {
                connection.rollback(function () {
                  res
                    .status(400)
                    .send({ success: false, msg: "Selected quantity greater than quantity available for purchase" });
                });
                connection.release();
              }
            }
          });
        });
      }
    })
  })

  app.get('/transactions', (req, res) => {
    pool.getConnection(function(err, connection) {
      if(err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const sql = "SELECT * FROM transactions WHERE purchase_user_id = ?";
          connection.query(sql, [user.id], (err, results) => {
            connection.release();
            if(err) {
              logger.error("Error getting your transactions: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error getting your transactions" });
            } else {
              res.status(200).send({ success: true, data: results });
            }
          })
        })
      }
    })
  })

    // Reviews POST /reviews/{userid}
    app.post("/reviews/", (req, res) => {
      pool.getConnection(function (err, connection) {
        if (err) {
          // if there is an issue obtaining a connection, release the connection instance and log the error
          logger.error("Problem obtaining MySQL connection", err);
          res.status(400).send("Problem obtaining MySQL connection");
        } else {
          jwt.verifyToken(req).then((user) => {
            const reviewee = req.body.reviewee;
            const reviewer = user.id;
            const msg = req.body.msg;
            const stars = req.body.stars;
  
            var sql = "INSERT INTO db.review (reviewee_id,reviewer_id,review_date,msg,stars) VALUES (?,?,NOW(),?,?)";
            
            connection.beginTransaction();
            connection.query(sql, [reviewee, reviewer, msg, stars], (err, rows) => {
              if (err) {
                connection.rollback();
                connection.release();
                logger.error("Error retrieving Database Information: \n", err);
                res.status(400).send({ success: false, msg: "Error adding Review" });
              }
              else {
                sql = "INSERT INTO notification (user_id, has_seen, date, text) VALUES (?, 0, now(), ?)";
                connection.query(sql, [user.id, "You have a new review!"], (error, results) => {
                  if(err) {
                    connection.rollback();
                    connection.release();
                    logger.error("Error adding notification: \n", err);
                    res.status(400).send({ success: false, msg: "Error adding notification" });
                  } else {
                    connection.commit();
                    connection.release();
                    res.status(200).send({ success: true, msg: "Added Review and created notification" })
                  }
                })
              }
            })
          });
        }
      });
    });
  
  
    // Reviews GET /reviews/{userid}
    app.get("/reviews/", (req, res) => {
      pool.getConnection(function (err, connection) {
        if (err) {
          // if there is an issue obtaining a connection, release the connection instance and log the error
          logger.error("Problem obtaining MySQL connection", err);
          res.status(400).send("Problem obtaining MySQL connection");
        } else {
          jwt.verifyToken(req).then((user) => {
            const reviewer = user.id;
  
            var sql = "SELECT * FROM db.review WHERE reviewer_id = ?";
  
            connection.query(sql, [reviewer], (err, rows) => {
              connection.release();
              if (err) {
                logger.error("Error retrieving Database Information: \n", err);
                res.status(400).send({ success: false, msg: "Error retrieving Review" });
              }
              else {
                res.status(200).send({ success: true, msg: "Got User Reviews", data: rows })
              }
            })
          });
        }
      });
    });
};

function createAuctionNotification(req, res, auction, text)
{
  pool.getConnection(function (err, connection) {
    jwt.verifyToken(req).then((user) => {
      const sql = "INSERT INTO notification (user_id, has_seen, date, text) VALUES (?, 0, now(), ?)";
      connection.query(sql, [auction[0].list_user_id, text], (err, results) => {
        if(err) {
          connection.rollback();
          connection.release();
          logger.error("Error creating notification: \n", err);
          res
            .status(400)
            .send({ success: false, msg: "Error creating notification" });
        } else {
          connection.commit();
          connection.release();
        }
      })
    })
  })
}

function createTransaction(req, res, listing_id, purchase_type, purchase_quantity, auction) {
  pool.getConnection(function (err, connection) {
    jwt.verifyToken(req).then((user) => {
      const price = getListingPrice(auction[0].base_price, auction[0].discount_price, auction[0].discount_end, purchase_quantity)
      const createTransaction = "INSERT INTO transactions (listing_id, list_user_id, purchase_user_id, listing_type, quantity, price) VALUES(?, ?, ?, ?, ?, ?)";
      connection.query(createTransaction, [listing_id, auction[0].list_user_id, user.id,
                      purchase_type, purchase_quantity, price], (err, results) => {
        if(err) {
        connection.rollback();
        connection.release();
        logger.error("Error creating transaction: \n", err);
        res
          .status(400)
          .send({ success: false, msg: "Error creating transaction" });
        } else {
          createAuctionNotification(req, res, auction, "Your fixed price auction has ended");
          connection.release();
          res
            .status(200)
            .send({ success: true, msg: "Transaction and notification created", price: price})
        }                                                          
      })
    })
  })
}

function getListingPrice(base_price, discount_price, discount_end, quantity) {
  var curr = new Date();
  var discount = new Date(discount_end);

  if(curr < discount) {
    return discount_price * quantity;
  } else if(curr > discount) {
    return base_price * quantity;
  }
}
