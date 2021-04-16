const pool = require("./db");

function check(logger) {
    logger.info("Checking auctions that are done")

    pool.getConnection(function (err, connection) {
        if (err) {
            // if there is an issue obtaining a connection, release the connection instance and log the error
            logger.error("Problem obtaining MySQL connection", err);
        }
        else {
            const sql = "SELECT * FROM auction WHERE now() >= end_date AND is_finished = false";
            connection.query(sql, [], (err, result) => {
                if (err) {
                    logger.error("Error checking auctions: \n", err);
                } else {
                    result.forEach((row) => {
                        const sql1 = "UPDATE auction SET is_finished = true WHERE auction.id = ?";
                        connection.query(sql1, [row.id], (err, result) => {
                            connection.release();
                            if (err) {
                                logger.error("Error updating auction: \n", err);
                            } else {
                                //Create transcation
                                //TODO: Copy sams code in here
                            }
                        });
                    })
                }
            })
        }
    })
}

module.exports.start = function (logger) {
    setInterval(check, 60 * 1000, logger)
}