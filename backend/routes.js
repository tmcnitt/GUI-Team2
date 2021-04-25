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
        pool.query(sql, [username, hash, type], (err, result) => {
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
  });

  // Users POST /login
  app.post("/login", (req, res) => {
    // if there is no issue obtaining a connection, execute query and release connection
    const username = req.body.username;
    var sql = "SELECT * FROM db.users WHERE username = ?";
    pool.query(sql, [username], (err, rows) => {
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
            let { username, user_type, id } = rows[0];
            const JWT = jwt.makeJWT(rows[0].id);
            res.status(200).send({
              success: true,
              data: { jwt: JWT, username, user_type, id },
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
  });

  app.get("/users/check", (req, res) => {
    jwt
      .verifyToken(req)
      .then((user) => {
        user = { username: user.username, user_type: user.user_type, id: user.id };
        res.status(200).send(user);
      })
      .catch(() => {
        res.status(400).end();
      });
  });

  // Products GET returns all prodcuts
  app.get("/products", (req, res) => {
    // if there is no issue obtaining a connection, execute query and release connection
    const sql = "SELECT * FROM products";
    pool.query(sql, (err, rows) => {
      if (err) {
        logger.error("Error retrieving products: \n", err);
        res.status(400).send({
          success: false,
          msg: "Error retrieving products",
        });
      } else {
        res.status(200).send({ success: true, data: rows });
      }
    })
  });

  // Products GET returns all prodcuts
  app.get("/products/:id", (req, res) => {
    const id = req.param('id');
    res.sendFile(__dirname + '/imgs/' + id + ".jpeg")
  });

  // Products POST create new product
  app.post("/products", (req, res) => {
    // if there is no issue obtaining a connection, execute query and release connection
    const name = req.body.name;
    const sql = "INSERT INTO products (name) VALUES(?)";

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    pool.query(sql, [name], (err, result) => {
      if (err) {
        logger.error("Error adding product: \n", err);
        res
          .status(400)
          .send({ success: false, msg: "Error adding product" });
      } else {

        let file = req.files.file;
        uploadPath = __dirname + '/imgs/' + result.insertId + ".jpeg"

        // Use the mv() method to place the file somewhere on your server
        file.mv(uploadPath, function (err) {
          if (err) {
            res
              .status(400)
              .send({ success: false, msg: "Error uploading image" });
            return
          }

          res
            .status(200)
            .send({ success: true, msg: "Product successfully added", data: result.insertId });
        });
      }
    });
  });

  // POST /fixed (create a fixed auction)
  app.post('/fixed', (req, res) => {
    // if there is no issue obtaining a connection, execute query and release connection
    jwt.verifyToken(req).then((user) => {
      const product_id = req.body.product_id;
      const list_user_id = user.id;

      //Cant start a listing finished
      const is_finished = false;
      //Cant start a listing discounted
      const is_discounted = false;

      const description = req.body.description;
      const base_price = req.body.base_price;
      const quantity = req.body.quantity;
      const sql = "INSERT INTO fixed_price (product_id, list_user_id, is_finished, is_discounted, description, base_price, quantity) VALUES( ?, ?, ?, ?, ?, ?, ?)";

      pool.query(sql, [product_id, list_user_id, is_finished, is_discounted, description, base_price, quantity], (err, results) => {
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
  })

  // GET /fixed (get all current fixed options)
  //GET -> /fixed/:id -> get all running fixed listed by user with id
  app.get('/fixed/:id?', (req, res) => {
    jwt.verifyToken(req).then(() => {

      const id = req.param('id')

      let mod = "is_finished = 0"
      if (id) {
        //Speical sold out but not 30 days cond
        mod = " db.fixed_price.list_user_id = ? AND ( DATEDIFF(now(), last_transaction.date) < 30 OR is_finished = 0 ) "
      }

      // get the auction
      // Convert the user id into a username for the table
      // Convert the reviews into an average score
      // Get the last transcation date for the listings page
      const sql = `
          SELECT 
            db.fixed_price.*, 
            IF(
              discount_end IS NOT NULL and now() < discount_end, 
              discount_price, 
              base_price
            ) as price,
            db.users.username as list_username,
            AVG(db.review.stars) as avglist_user_score,
            bought_history.buy_count as list_user_buy_count,
            sell_history.sell_count as list_user_sell_count,
            products.name as product_name
          FROM 
            db.fixed_price
          LEFT JOIN 
            db.users 
          ON db.users.id = db.fixed_price.list_user_id
          LEFT JOIN
            db.review
          ON db.users.id = db.review.reviewee_id
          LEFT JOIN (
            SELECT 
              purchase_user_id, 
              COUNT(*) as buy_count
            FROM 
              transactions 
            GROUP BY 
              purchase_user_id
          ) as bought_history
          ON db.users.id = bought_history.purchase_user_id 
          LEFT JOIN (
            SELECT 
              list_user_id, 
              COUNT(*) as sell_count
            FROM 
              transactions 
            GROUP BY 
            list_user_id
          ) as sell_history
          ON db.users.id = sell_history.list_user_id 
          LEFT JOIN products 
          ON products.id = fixed_price.product_id
          LEFT JOIN (
            SELECT 
              product_id, 
              max(date) as date
            FROM 
              transactions 
            GROUP BY 
              product_id
          ) as last_transaction
          ON products.id = last_transaction.product_id
          WHERE 
        ` + mod + " GROUP BY db.fixed_price.id HAVING product_name IS NOT NULL";

      pool.query(sql, [id], (err, rows) => {
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
    }).catch(() => {
      res.status(400).end();
    })
  })

  // PUT /fixed/{id} (update an auction with discount price, description, base price, discount end)
  app.put('/fixed/:id', (req, res) => {
    jwt.verifyToken(req).then((user) => {
      const user_id = user.id;
      const id = req.param('id');
      const auction = "SELECT description, discount_price, base_price, discount_end FROM fixed_price WHERE list_user_id = ? AND id = ?";

      pool.query(auction, [user_id, id], (err, results) => {
        if (err || results.length == 0) {
          logger.error("Error retrieving auction information: \n", err);
          res
            .status(400)
            .send({ success: false, msg: "Error retrieving auction information" });
        } else {
          console.log(results[0])
          const description = req.body.description || results[0].description;
          const discount_price = req.body.discount_price || results[0].discount_price || undefined;
          const base_price = req.body.base_price || results[0].base_price;
          const discount_end = req.body.discount_end || results[0].discount_end || undefined;
          const quantity = req.body.quantity || results[0].quantity;
          const sql = "UPDATE fixed_price SET description = ?, discount_price = ?, base_price = ?, discount_end = ?, quantity = ? WHERE list_user_id = ? AND id = ?";

          pool.query(sql, [description, discount_price, base_price, discount_end, quantity, user_id, id], (error, result) => {
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
  })

  // DELETE /fixed/{id} (delete selected auction)
  app.delete('/fixed/:id', (req, res) => {
    jwt.verifyToken(req).then((user) => {
      const user_id = user.id;
      const sql = "DELETE FROM fixed_price WHERE id = ? AND list_user_id = ?";

      pool.query(sql, [req.param('id'), user_id], (err, result) => {
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
  })

  // POST /buy/{id} (user buys auction, update quantity or end listing and create transaction)
  app.post('/fixed/:id/buy', (req, res) => {
    const getAuction = "SELECT * FROM fixed_price WHERE id = ?";
    pool.query(getAuction, [req.param('id')], (err, auction) => {
      if (err) {
        logger.error("Error retrieving auction information: \n", err);
        res
          .status(400)
          .send({ success: false, msg: "Error retrieving auction information" });
      } else {
        if (!auction[0]) {
          res
            .status(400)
            .send({ success: false, msg: "Could not find auction" });
          return
        }
        const purchase_quantity = req.body.purchase_quantity;
        if (purchase_quantity < auction[0].quantity) {
          const quantity_remaining = auction[0].quantity - purchase_quantity;
          const update = "UPDATE fixed_price SET quantity = ? WHERE id = ?";
          pool.query(update, [quantity_remaining, req.param('id')], (err) => {
            if (err) {
              logger.error("Error updating auction information: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error updating auction information" });
            } else {
              createTransactionAndNotification(req, res, 2, purchase_quantity, auction, "Some of your fixed auction has been sold.");
            }
          });
        } else if (purchase_quantity == auction[0].quantity) {
          const update = "UPDATE fixed_price SET quantity = 0, is_finished = 1 WHERE id = ?";
          pool.query(update, [req.param('id')], (err) => {
            if (err) {
              logger.error("Error updating auction information: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error updating auction information" });
            } else {
              const transactionID = req.body.id;
              createTransactionAndNotification(req, res, 2, purchase_quantity, auction, "Your fixed price auction has ended");
            }
          });
        } else {
          res
            .status(400)
            .send({ success: false, msg: "Selected quantity greater than quantity available for purchase" });
        }
      }
    })
  })

  app.get('/transactions', (req, res) => {
    jwt.verifyToken(req).then((user) => {
      //get the transcation and see if there is a mutal review 
      const sql = `
        SELECT 
          transactions.*,
          purchaser_reviews.stars as purchaser_reviews_stars,
          lister_reviews.stars as lister_reviews_stars,
          purchase_user_id = ? as is_purchaser,
          products.name as product_name,
          list_user.username as lister_username,
          purchase_user.username as purchaser_username
        FROM 
          transactions 
        LEFT JOIN
          db.review as purchaser_reviews
        ON
            transactions.list_user_id = purchaser_reviews.reviewee_id AND
            transactions.purchase_user_id = purchaser_reviews.reviewer_id
        LEFT JOIN
          db.review as lister_reviews
        ON
            transactions.purchase_user_id = lister_reviews.reviewee_id AND
            transactions.list_user_id = lister_reviews.reviewer_id
        LEFT JOIN
          products
        ON products.id = transactions.product_id  
        LEFT JOIN
          users as purchase_user
        ON purchase_user.id = transactions.purchase_user_id  
        LEFT JOIN
          users as list_user
        ON list_user.id = transactions.list_user_id

        WHERE 
          purchase_user_id = ? OR list_user_id = ?
        `;
      pool.query(sql, [user.id, user.id, user.id], (err, results) => {
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
  })

  // Reviews POST /reviews/{userid}
  app.post("/reviews/", (req, res) => {
    jwt.verifyToken(req).then((user) => {
      const reviewee = req.body.reviewee;
      const reviewer = user.id;
      const msg = req.body.msg;
      const stars = req.body.stars;

      var sql = "INSERT INTO db.review (reviewee_id,reviewer_id,review_date,msg,stars) VALUES (?,?,NOW(),?,?)";

      pool.query(sql, [reviewee, reviewer, msg, stars], (err, rows) => {
        if (err) {
          logger.error("Error retrieving Database Information: \n", err);
          res.status(400).send({ success: false, msg: "Error adding Review" });
        }
        else {
          sql = "INSERT INTO notification (user_id, has_seen, date, text) VALUES (?, 0, now(), ?)";
          pool.query(sql, [req.body.reviewee, "You have a new review!"], (error, results) => {
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
  });


  // Reviews GET /reviews/{userid}
  app.get("/reviews/", (req, res) => {
    jwt.verifyToken(req).then((user) => {
      const reviewer = user.id;

      var sql = "SELECT * FROM db.review WHERE reviewer_id = ?";

      pool.query(sql, [reviewer], (err, rows) => {
        if (err) {
          logger.error("Error retrieving Database Information: \n", err);
          res.status(400).send({ success: false, msg: "Error retrieving Review" });
        }
        else {
          res.status(200).send({ success: true, msg: "Got User Reviews", data: rows })
        }
      })
    }).catch(() => {
      res.status(400).end();
    });;
  });

  app.post('/auctions', async (req, res) => {
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
      pool.query(sql, [current_bid, list_user_id, bid_user_id, product_id, show_user_bid, is_finished, start_date, end_date, description], (err, result) => {
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
    }).catch(() => {
      res.status(400).end();
    });;
  })


  //GET -> /auctions -> get all running auctions
  //GET -> /auctions/:id -> get all running auctions listed by user with id
  app.get('/auctions/:id?', function (req, res) {
    jwt.verifyToken(req).then((user) => {

      const id = req.param('id')
      let mod = ""
      if (id) {
        mod = " AND db.auction.list_user_id = ?"
      }

      // get the auction
      // Convert the user id into a username for the table
      // Convert the reviews into an average score
      const sql = `
      SELECT 
        db.auction.*,
        db.users.username as list_username,
        AVG(db.review.stars) as avglist_user_score,
        bought_history.buy_count as list_user_buy_count,
        sell_history.sell_count as list_user_sell_count,
        products.name as product_name,
        IF(
          auction.show_user_bid OR 
          auction.bid_user_id = ? OR 
          auction.list_user_id = ?, 
          bid_user.username, 
          ""
        ) as bid_username
      FROM 
        db.auction 
      LEFT JOIN 
        db.users 
      ON db.users.id = db.auction.list_user_id
      LEFT JOIN
        db.review
      ON db.users.id = db.review.reviewee_id
      LEFT JOIN (
        SELECT 
          purchase_user_id, 
          COUNT(*) as buy_count
        FROM 
          transactions 
        GROUP BY 
          purchase_user_id
      ) as bought_history
      ON db.users.id = bought_history.purchase_user_id 
      LEFT JOIN (
        SELECT 
          list_user_id, 
          COUNT(*) as sell_count
        FROM 
          transactions 
        GROUP BY 
        list_user_id
      ) as sell_history
      ON db.users.id = sell_history.list_user_id
      LEFT JOIN products 
      ON products.id = auction.product_id
      LEFT JOIN users as bid_user
      ON bid_user.id = auction.bid_user_id
      WHERE 
        is_finished = false AND 
        now() > start_date AND 
        now() < end_date` + mod + "  GROUP BY db.auction.id HAVING product_name IS NOT NULL";

      pool.query(sql, [user.id, user.id, id], (err, rows) => {
        if (err) {
          logger.error("Error retrieving auctions: \n", err);
          res.status(400).send({
            success: false,
            msg: "Error retrieving auctions",
          });
        } else {
          res.status(200).send({ success: true, data: rows });
        }
      })
    }).catch(() => {
      res.status(400).end();
    });
  });

  //DELETE -> /auctions/:id -> stop auction
  app.delete('/auctions/:id', async (req, res) => {
    jwt.verifyToken(req).then((user) => {
      const id = req.param('id');
      const user_id = user.id;

      const get = "SELECT * FROM auction WHERE auction.id = ? AND auction.list_user_id = ?"
      pool.query(get, [id, user_id], (err, results) => {
        if (err) {
          res.status(400).send({
            success: false,
            msg: "Error deleteing auction",
          });
          logger.error("Error deleting auction: \n", err);

          return
        }

        const sql = "DELETE FROM auction WHERE auction.id = ? AND auction.list_user_id = ?";
        pool.query(sql, [id, user_id], (err) => {
          if (err) {
            logger.error("Error deleting auction: \n", err);
            res.status(400).send({
              success: false,
              msg: "Error deleting auctions",
            });
          } else {
            if (results[0].bid_user_id) {
              createNotification(req, res, results[0].bid_user_id, "An auction you were winning was cancelled!")
              res.status(200).send({ success: true, msg: "Deleted auction", });
            }
          }
        });
      })
    }).catch(() => {
      res.status(400).end();
    });;
  });

  //PUT /auction/:id -> upacte action, options: descpription,end_date
  app.put('/auctions/:id', async (req, res) => {
    jwt.verifyToken(req).then((user) => {
      const user_id = user.id;
      const id = req.param('id');

      const sql = "SELECT description, end_date, bid_user_id, show_user_bid FROM auction WHERE list_user_id = ? AND id = ?";
      pool.query(sql, [user_id, id], (err, results) => {
        if (err) {
          logger.error("Error retrieving auction information: \n", err);
          res
            .status(400)
            .send({ success: false, msg: "Error retrieving auction information" });
        } else {
          const description = req.body.description || results[0].description;
          const end_date = req.body.end_date || results[0].end_date;

          //True or false, need undefined check
          let show_user_bid = req.body.show_user_bid;
          if (show_user_bid === undefined) {
            show_user_bid = results[0].show_user_bid
          }


          const sql2 = "UPDATE auction SET description = ?, end_date = ?, show_user_bid = ? WHERE list_user_id = ? AND id = ?";
          pool.query(sql2, [description, end_date, show_user_bid, user_id, id], (error) => {
            if (error) {
              logger.error("Error updating auction information: \n", err);
              res
                .status(400)
                .send({ success: false, msg: "Error updating auction information" });
            } else {
              if (results[0].bid_user_id != results[0].list_user_id) {
                if (end_date != results[0].end_date) {
                  createNotification(req, res, results[0].bid_user_id, "An auction you were winning was extended!")
                }
              }

              res.status(200).send({ success: true, msg: "Auction updated" });
            }
          })
        }
      });
    }).catch(() => {
      res.status(400).end();
    });
  });


  //POST /auction/:id/bid -> User bids on auction, sends price
  app.post('/auctions/:id/bid', async (req, res) => {
    jwt.verifyToken(req).then((user) => {
      const id = req.param('id');
      const new_bid = req.body.new_bid;
      const bid_user_id = user.id;

      const sql = "UPDATE auction SET auction.current_bid = ? WHERE auction.id = ? AND is_finished = false AND ? > auction.current_bid AND now() < end_date";
      pool.query(sql, [new_bid, id, new_bid], (err, result) => {
        if (err) {
          logger.error("Error updating bid: \n", err);
          res
            .status(400)
            .send({ success: false, msg: "Error updating bid" });
        }
        else {
          const sql1 = "UPDATE auction SET auction.bid_user_id = ? WHERE auction.id = ?";
          pool.query(sql1, [bid_user_id, id], (err, result) => {
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
    }).catch(() => {
      res.status(400).end();
    });
  });


  // GET /notifications/new
  app.get("/notifications/", (req, res) => {
    // if there is no issue obtaining a connection, execute query and release connection
    jwt.verifyToken(req).then((user) => {
      const userid = user.id;

      // return unseen notifications
      const sql = "SELECT * FROM notification WHERE has_seen = 0 AND user_id = ?"
      pool.query(sql, [userid], (err, rows) => {
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
    }).catch(() => {
      res.status(400).end();
    });;
  });

  // PUT /notifications/new
  app.put("/notifications/", (req, res) => {
    jwt.verifyToken(req).then((user) => {
      const userid = user.id;
      // if there is no issue obtaining a connection, execute query and release connection
      // return unseen notifications
      const sql = "UPDATE notification SET has_seen = 1 WHERE has_seen = 0 AND user_id = ?"
      pool.query(sql, [userid], (err, rows) => {
        if (err) {
          logger.error("Error updating notifications: \n", err);
          res.status(400).send({
            success: false,
            msg: "Error updating notifications"
          })
        } else {
          res.status(200).send({ success: true });
        }
      })
    }).catch(() => {
      res.status(400).end();
    });
  })
}

function createNotification(req, res, user_id, text) {
  const sql = "INSERT INTO notification (user_id, has_seen, date, text) VALUES (?, 0, now(), ?)";
  pool.query(sql, [user_id, text], (err, results) => {
    if (err) {
      logger.error("Error creating notification: \n", err);
      res
        .status(400)
        .send({ success: false, msg: "Error creating notification" });
    }
  })
}

function createTransactionAndNotification(req, res, purchase_type, purchase_quantity, auction, msg) {
  jwt.verifyToken(req).then((user) => {
    const price = getListingPrice(auction[0].base_price, auction[0].discount_price, auction[0].discount_end, purchase_quantity)
    const createTransaction = "INSERT INTO transactions ( list_user_id, purchase_user_id, listing_type, quantity, price, product_id, date) VALUES(?, ?, ?, ?, ?, ?, NOW())";
    pool.query(createTransaction, [auction[0].list_user_id, user.id,
      purchase_type, purchase_quantity, price, auction[0].product_id], (err, results) => {
        if (err) {
          logger.error("Error creating transaction: \n", err);
          res
            .status(400)
            .send({ success: false, msg: "Error creating transaction" });
        } else {
          createNotification(req, res, auction[0].list_user_id, msg);
          res
            .status(200)
            .send({ success: true, msg: "Purchase complete", price: price })
        }
      })
  }).catch(() => {
    res.status(400).end();
  });
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
