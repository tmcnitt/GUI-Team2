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
      if (err) {
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
            if (err) {
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
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        // if there is no issue obtaining a connection, execute query and release connection
        const sql = "SELECT * FROM fixed_price WHERE is_finished = 0";
        connection.query(sql, (err, rows) => {
          connection.release();
          if (err) {
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
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const user_id = user.id;
          const id = req.param('id');
          const auction = "SELECT description, discount_price, base_price, discount_end FROM fixed_price WHERE list_user_id = ? AND id = ?";

          connection.query(auction, [user_id, id], (err, results) => {
            if (err) {
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
                if (error) {
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
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const user_id = user.id;
          const sql = "DELETE FROM fixed_price WHERE id = ? AND list_user_id = ?";

          connection.query(sql, [req.param('id'), user_id], (err, result) => {
            connection.release();
            if (err) {
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
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        const getAuction = "SELECT * FROM fixed_price WHERE id = ?";
        connection.query(getAuction, [req.param('id')], (err, auction) => {
          if (err) {
            logger.error("Error retrieving auction information: \n", err);
            res
              .status(400)
              .send({ success: false, msg: "Error retrieving auction information" });
          } else {
            const purchase_quantity = req.body.purchase_quantity;
            if (purchase_quantity < auction[0].quantity) {
              const quantity_remaining = auction[0].quantity - purchase_quantity;
              const update = "UPDATE fixed_price SET quantity = ? WHERE id = ?";
              connection.query(update, [quantity_remaining, req.param('id')], (updateErr) => {
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
              res
                .status(400)
                .send({ success: false, msg: "Selected quantity greater than quantity available for purchase" });
            }
          }
        });
      }
    })
  })

  app.get('/transactions', (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const sql = "SELECT * FROM transactions WHERE purchase_user_id = ?";
          connection.query(sql, [user.id], (err, results) => {
            connection.release();
            if (err) {
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

          connection.query(sql, [reviewee, reviewer, msg, stars], (err, rows) => {
            if (err) {
              logger.error("Error retrieving Database Information: \n", err);
              res.status(400).send({ success: false, msg: "Error adding Review" });
            }
            else {
              sql = "INSERT INTO notification (user_id, has_seen, date, text) VALUES (?, 0, now(), ?)";
              connection.query(sql, [user.id, "You have a new review!"], (error, results) => {
                connection.release();
                if (err) {
                  logger.error("Error adding notification: \n", err);
                  res.status(400).send({ success: false, msg: "Error adding notification" });
                } else {
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

  app.post('/auctions', async (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const current_bid = req.body.current_bid;
          const list_user_id = user.id;
          const bid_user_id = 0;
          const product_id = req.body.product_id;
          const show_user_bid = req.body.show_user_bid;
          const is_finished = false;
          const start_date = req.body.start_date;
          const end_date = req.body.end_date;
          const description = req.body.description;

          const sql = "INSERT INTO auction (current_bid,list_user_id,bid_user_id,product_id,show_user_bid,is_finished,start_date,end_date,description) VALUES (?,?,?,?,?,?,?,?,?)";
          connection.query(sql, [current_bid, list_user_id, bid_user_id, product_id, show_user_bid, is_finished, start_date, end_date, description], (err, result) => {
            connection.release();
            if (err) {
              logger.error("Error creating auction: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error creating auction" });
            } else {
              res
                .status(200)
                .send({ success: true, msg: "Auction successfully created" });
            }
          });
        })
      }
    });
  })


  //GET -> /auctions -> get all running auctions
  app.get('/auctions', function (req, res) {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err, rows);
        res.status(400).send("Problem obtaining MySQL connection");
      }
      else {
        const sql = "SELECT * FROM auction WHERE is_finished = false AND now() > start_date AND now() < end_date";
        connection.query(sql, (err, rows) => {
          connection.release();
          if (err) {
            logger.error("Error retrieving auctions: \n", err);
            res.status(400).send({
              success: false,
              msg: "Error retrieving auctions",
            });
          } else {
            res.status(200).send({ success: true, data: rows });
          }
        });
      }
    });
  });

  //DELETE -> /auctions/:id -> stop auction
  app.delete('/auctions/:id', async (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err, rows);
        res.status(400).send("Problem obtaining MySQL connection");
      }
      else {
        jwt.verifyToken(req).then((user) => {
          const id = req.body.id;
          const user_id = user.id;
          const sql = "DELETE FROM auction WHERE auction.id = ? AND auction.list_user_id = ?";
          connection.query(sql, [id, user_id], (err, result) => {
            connection.release();
            if (err) {
              logger.error("Error deleting auction: \n", err);
              res.status(400).send({
                success: false,
                msg: "Error deleting auctions",
              });
            } else {
              res.status(200).send({ success: true, msg: "Deleted auction", });
            }
          });
        })
      }
    });
  });

  //PUT /auction/:id -> upacte action, options: descpription,end_date
  app.put('/auctions/:id', async (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err, rows);
        res.status(400).send("Problem obtaining MySQL connection");
      }
      else {
        jwt.verifyToken(req).then((user) => {
          const user_id = user.id;
          const id = req.param('id');

          const sql = "SELECT description, end_date, show_user_bid FROM auction WHERE list_user_id = ? AND id = ?";
          connection.query(sql, [user_id, id], (err, results) => {
            if (err) {
              logger.error("Error retrieving auction information: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error retrieving auction information" });
            } else {
              const description = req.body.description || results[0].description;
              const end_date = req.body.end_date || results[0].end_date;
              const show_user_bid = req.body.show_user_bid || results[0].show_user_bid;


              const sql2 = "UPDATE auction SET description = ?, end_date = ?, show_user_bid = ? WHERE list_user_id = ? AND id = ?";
              connection.query(sql2, [description, end_date, show_user_bid, user_id, id], (error, result) => {
                connection.release();
                if (error) {
                  logger.error("Error updating auction information: \n", err);
                  res
                    .status(400)
                    .send({ success: false, msg: "Error updating auction information" });
                } else {
                  res
                    .status(200)
                    .send({ succes: true, msg: "Auction updated" })
                }
              })
            }
          });

        });
      }
    });
  });


  //POST /auction/:id/bid -> User bids on auction, sends price
  app.post('/auctions/:id/bid', async (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err, rows);
        res.status(400).send("Problem obtaining MySQL connection");
      }
      else {
        jwt.verifyToken(req).then((user) => {
          const id = req.param('id');
          const new_bid = req.body.new_bid;
          const bid_user_id = user.id;

          const sql = "UPDATE auction SET auction.current_bid = ? WHERE auction.id = ? AND is_finished = false AND ? > auction.current_bid AND now() < end_date";
          connection.query(sql, [new_bid, id, new_bid], (err, result) => {
            if (err) {
              logger.error("Error updating bid: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error updating bid" });
            }
            else {
              const sql1 = "UPDATE auction SET auction.bid_user_id = ? WHERE auction.id = ?";
              connection.query(sql1, [bid_user_id, id], (err, result) => {
                connection.release();
                if (err) {
                  logger.error("Error updating auction: \n", err);
                  res
                    .status(400)
                    .send({ success: false, msg: "Error updating auction" });
                }

                else {
                  res
                    .status(200)
                    .send({ success: true, msg: "Bid placed" });
                }
              });
            }
          });
        })
      }
    });
  });


  // GET /notifications
  app.get("/notifications", (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const userid = user.id;

          // get all notifications
          const sql = "SELECT * FROM notification WHERE user_id = ?"
          connection.query(sql, [userid], (err, rows) => {
            if (err) {
              logger.error("Error retrieving notifications: \n", err);
              res.status(400).send({
                success: false,
                msg: "Error retrieving notifications"
              })
            } else {
              res.status(200).send({ success: true, data: rows });
            }
          });
        });
      }
    });
  });


  // GET /notifications/new
  app.get("/notifications/new", (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        // if there is no issue obtaining a connection, execute query and release connection
        jwt.verifyToken(req).then((user) => {
          const userid = user.id;

          // return unseen notifications
          const sql = "SELECT * FROM notification WHERE has_seen = 0 AND user_id = ?"
          connection.query(sql, [userid], (err, rows) => {
            if (err) {
              logger.error("Error retrieving notifications: \n", err);
              res.status(400).send({
                success: false,
                msg: "Error retrieving notifications"
              })
            } else {
              res.status(200).send({ success: true, data: rows });
            }
          });
        });
      }
    });
  });

  // PUT /notifications/new
  app.put("/notifications/new", (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error("Problem obtaining MySQL connection", err);
        res.status(400).send("Problem obtaining MySQL connection");
      } else {
        jwt.verifyToken(req).then((user) => {
          const userid = user.id;
          // if there is no issue obtaining a connection, execute query and release connection
          // return unseen notifications
          const sql = "UPDATE notification SET has_seen = 1 WHERE has_seen = 0 AND user_id = ?"
          connection.query(sql, [userid], (err, rows) => {
            if (err) {
              logger.error("Error updating notifications: \n", err);
              res.status(400).send({
                success: false,
                msg: "Error updating notifications"
              })
            } else {
              res.status(200).send({ success: true, data: rows });
            }
          })
        })
      }
    })
  })
};

function createAuctionNotification(req, res, list_user_id, text) {
  pool.getConnection(function (err, connection) {
    jwt.verifyToken(req).then((user) => {
      const sql = "INSERT INTO notification (user_id, has_seen, date, text) VALUES (?, 0, now(), ?)";
      connection.query(sql, [list_user_id, text], (err, results) => {
        connection.release();
        if (err) {
          logger.error("Error creating notification: \n", err);
          res
            .status(400)
            .send({ success: false, msg: "Error creating notification" });
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
          connection.release();
          if (err) {
            logger.error("Error creating transaction: \n", err);
            res
              .status(400)
              .send({ success: false, msg: "Error creating transaction" });
          } else {
            createAuctionNotification(req, res, auction[0].list_user_id, "Your fixed price auction has ended");
            res
              .status(200)
              .send({ success: true, msg: "Transaction and notification created", price: price })
          }
        })
    })
  })
}

function getListingPrice(base_price, discount_price, discount_end, quantity) {
  var curr = new Date();
  var discount = new Date(discount_end);

  if (curr < discount) {
    return discount_price * quantity;
  } else if (curr > discount) {
    return base_price * quantity;
  }
}
