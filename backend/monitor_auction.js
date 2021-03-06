const pool = require("./db");

function check(logger) {
    logger.info("Checking auctions that are done")

    const sql = "SELECT * FROM auction WHERE now() >= end_date AND is_finished = false";
    pool.query(sql, [], (err, result) => {
        result.forEach((row) => {
            const sql1 = "UPDATE auction SET is_finished = true WHERE auction.id = ?";
            pool.query(sql1, [row.id], (err, result) => {
                if (err) {
                    logger.error("Error updating auction: \n", err);
                    return
                }

                const sql3 = "INSERT INTO notification (user_id, has_seen, date, text) VALUES (?, 0, now(), ?)";
                if (row.list_user_id == row.bid_user_id) {
                    pool.query(sql3, [row.list_user_id, "Your action ended with no bids :("], (err, results) => {
                        if (err) {
                            logger.error("Error creating list user notification: \n", err);
                        }
                    })
                    return
                }

                const sql2 = "INSERT INTO transactions (list_user_id, purchase_user_id, listing_type, price, date, product_id, quantity) VALUES(?, ?, ?, ?, NOW(), ?, 1)"
                pool.query(sql2, [row.list_user_id, row.bid_user_id, 1, row.current_bid, row.product_id], (err, result) => {
                    if (err) {
                        logger.error("Error creating transactions: \n", err);
                        return
                    }
                    pool.query(sql3, [row.list_user_id, "Your auction has finished!"], (err, results) => {
                        if (err) {
                            logger.error("Error creating list user notification: \n", err);
                            return
                        }
                        pool.query(sql3, [row.bid_user_id, "Congratulations you won an auction!"], (err, results) => {
                            if (err) {
                                logger.error("Error creating list user notification: \n", err);
                            }
                        })
                    })
                })
            })
        })
    })
}

module.exports.start = function (logger) {
    setInterval(check, 30 * 1000, logger)
}