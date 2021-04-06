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
        res.status(400);
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
            const id = req.body.id;
            const product_id = req.body.product_id;
            const list_user_id = user.id;
            const is_finished = req.body.is_finished;
            const is_discounted = req.body.is_discounted;
            const description = req.body.description;
            const base_price = req.body.base_price;
            const sql = "INSERT INTO fixed_price (id, product_id, list_user_id, is_finished, is_discounted, description, base_price) VALUES(?, ?, ?, ?, ?, ?, ?)";

            connection.query(sql, [id, product_id, list_user_id, is_finished, is_discounted, description, base_price], (err, results) => {
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
        const sql = "SELECT * FROM fixed_price";
        connection.query(sql, (err, rows) => {
          if(err) {
            logger.error("Error getting fixed price listings: \n", err);
            res
              .status(400)
              .send({ success: false, msg: "Error getting fixed price listings" });
          } else {
            res
              .status(200)
              .send({ succes: true, data: rows })
          }
        })
      }
    })
  })

  // PUT /fixed/{id} (update an auction with discount price, description, base price, discount end)

  // DELETE /fixed/{id} (delete selected auction)

  // POST /fixed/{id} (user buying auction set is_finished to true)
};
