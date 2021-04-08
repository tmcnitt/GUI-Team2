const pool = require("./db");
const bcrypt = require("bcryptjs");
const { config } = require("./db");

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
};


//POST -> /auction -> create auction
app.post('/auction', async (req,res)=>{
  pool.getConnection(function (err, connection) {
    if (err) {
      // if there is an issue obtaining a connection, release the connection instance and log the error
      logger.error("Problem obtaining MySQL connection", err);
      res.status(400).send("Problem obtaining MySQL connection");
    }else{
      const id = req.body.id;
      const current_bid = req.body.current_bid;
      const list_user_id = req.body.list_user_id;
      const bid_user_id = req.body.bid_user_id;
      const product_id = req.body.product_id;
      const show_user_bid = req.body.show_user_bid;
      const is_finished = req.body.is_finished;
      const start_date = req.body.start_date;
      const end_date = req.body.end_date;
      const description = req.body.Description;

      const sql = "INSERT INTO auction (id,current_bid,list_user_id,bid_user_id,product_id,show_user_bid,is_finished,start_date,end_date,description) VALUES (?,?,?,?,?,?,?,?,?,?)";
      connection.query(sql,[id,current_bid,list_user_id,bid_user_id,product_id,show_user_bid,is_finished,start_date,end_date,description],(err, result) =>{
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
    }
  });
});

//GET -> /auctions -> get all running auctions
app.get('/auctions', function (req,res) {
  pool.getConnection(function (err, connection) {
  if (err) {
    // if there is an issue obtaining a connection, release the connection instance and log the error
    logger.error("Problem obtaining MySQL connection", err, rows);
    res.status(400).send("Problem obtaining MySQL connection");
  }
  else{
    const sql = "SELECT * FROM auction WHERE is_finished = false";
    connection.query(sql,(err,rows)=>{
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
app.delete('/auctions/:id', async (req,res)=>{
  pool.getConnection(function (err, connection) {
    if (err) {
      // if there is an issue obtaining a connection, release the connection instance and log the error
      logger.error("Problem obtaining MySQL connection", err, rows);
      res.status(400).send("Problem obtaining MySQL connection");
    }
    else{
      const id = req.body.id;
      const sql = "DELETE FROM auction WHERE auction.id = ?";
      connection.query(sql,[id],(err, result)=>{
        connection.release();
        if (err) {
          logger.error("Error deleting auction: \n", err);
          res.status(400).send({
            success: false,
            msg: "Error deleting auctions",
          });
        } else {
          res.status(200).send({ success: true, msg: "Deleted auction",});
        }
      });
    }
  });
});

//PUT /auction/:id -> upacte action, options: descpription,end_date
app.put('/auction/:id', async(req,res) =>{
  pool.getConnection(function (err, connection) {
    if (err) {
      // if there is an issue obtaining a connection, release the connection instance and log the error
      logger.error("Problem obtaining MySQL connection", err, rows);
      res.status(400).send("Problem obtaining MySQL connection");
    }
    else{
      const id = req.body.id;
      const end_date = req.body.end_date;
      const Description = req.body.Description;

      const sql1 = "UPDATE auction SET auction.end_date = ? WHERE auction.id = ?";
      connection.query(sql1,[end_date,id], (err, result)=>{
        connection.release();
        if (err) {
          logger.error("Error updating end date: \n", err);
          res
            .status(400)
            .send({ success: false, msg: "Error updating end date" });
        } else {
          res
            .status(200)
            .send({ success: true, msg: "End date successfully Updated" });
        }
      });

      const sql2 = "UPDATE auction SET auction.Description = ? WHERE auction.id = ?";
      connection.query(sql2,[Description,id], (err, result)=>{
        connection.release();
        if (err) {
          logger.error("Error updating desc: \n", err);
          res
            .status(400)
            .send({ success: false, msg: "Error updating desc" });
        } else {
          res
            .status(200)
            .send({ success: true, msg: "Desc successfully Updated" });
        }
      });
    }
  });

});


//POST /auction/:id/bid -> User bids on auction, sends price
app.post('/auction/:id/bid', async (req,res)=>{
  pool.getConnection(function (err, connection) {
    if (err) {
      // if there is an issue obtaining a connection, release the connection instance and log the error
      logger.error("Problem obtaining MySQL connection", err, rows);
      res.status(400).send("Problem obtaining MySQL connection");
    }
    else{
      const id = req.body.id;
      const new_bid = req.body.new_bid;
      const bid_user_id = req.body.bid_user_id;
      var updated = false;

      const sql = "UPDATE auction SET auction.current_bid = ? WHERE auction.id = ? IF (? > auction.current_bid)";
      connection.query(sql,[new_bid,id,new_bid], (err, result)=>{
        connection.release();
        if (err) {
          logger.error("Error updating bid: \n", err);
          res
            .status(400)
            .send({ success: false, msg: "Error updating bid" });
        } 
        else {
          updated = true;
          res
            .status(200)
            .send({ success: true, msg: "Bid successfully Updated" });
        }
      });
      if (updated){
        const sql1 = "UPDATE auction SET auction.bid_user_id = ? WHERE auction.id = ?";
        connection.query(sql1,[bid_user_id,id], (err, result)=>{
          connection.release();
          if (err) {
            logger.error("Error updating user: \n", err);
            res
              .status(400)
              .send({ success: false, msg: "Error updating user" });
          } 
          else {
            updated = true;
            res
              .status(200)
              .send({ success: true, msg: "User successfully Updated" });
          }
        });
      }
    }
  });
});