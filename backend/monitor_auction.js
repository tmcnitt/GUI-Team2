const pool = require("./db");

function check(logger) {
    logger.info("Checking auctions that are done")

    pool.getConnection(function (err, connection) {
        if (err) {
            // if there is an issue obtaining a connection, release the connection instance and log the error
            logger.error("Problem obtaining MySQL connection", err);
            return
        }
        const sql = "SELECT * FROM auction WHERE now() >= end_date AND is_finished = false";
        connection.query(sql, [], (err, result) => {
            connection.release()

            if (err) {
                logger.error("Error checking auctions: \n", err);
                return
            }

            result.forEach((row) => {
                pool.getConnection(function (err, connection) {
                    if (err) {
                        logger.error("Error checking auctions: \n", err);
                        return
                    }

                    const sql1 = "UPDATE auction SET is_finished = true WHERE auction.id = ?";
                    connection.query(sql1, [row.id], (err, result) => {
                        if (err) {
                            logger.error("Error updating auction: \n", err);
                            connection.release()
                            return
                        }
                        const sql2 = "INSERT INTO transactions (list_user_id, purchase_user_id, listing_type, price) VALUES(?, ?, ?, ?)"
                        connection.query(sql2, [row.list_user_id, row.bid_user_id, 1, 1, row.current_bid], (err, result) => {
                            if (err) {
                                logger.error("Error creating transactions: \n", err);
                                connection.release()
                                return
                            }
                            const sql3 = "INSERT INTO notification (user_id, has_seen, date, text) VALUES (?, 0, now(), ?)";
                            connection.query(sql3, [row.list_user_id, "Your auction has finished!"], (err, results) => {
                                if (err) {
                                    logger.error("Error creating list user notification: \n", err);
                                    connection.release()
                                    return
                                }
                                connection.query(sql3, [row.bid_user_id, "Congratulations you won an auction!"], (err, results) => {
                                    if (err) {
                                        logger.error("Error creating list user notification: \n", err);
                                    }
                                    connection.release()
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

module.exports.start = function (logger) {
    setInterval(check, 60 * 1000, logger)
}