
module.exports.GET_AUCTIONS = `
    SELECT
    db.auction.*,
    db.users.username as list_username,
    AVG(db.review.stars) as avglist_user_score,
    products.name as product_name,
    IF( auction.show_user_bid 
    OR auction.bid_user_id = ? 
    OR auction.list_user_id = ? , bid_user.username, "" ) as bid_username,
    best_review.stars as best_review_rating,
    best_review.msg as best_review_review,
    worst_review.stars as worst_review_rating,
    worst_review.msg as worst_review_review,
    prices.price as avg_sell_price 
    FROM
        db.auction 
        LEFT JOIN
            db.users 
            ON db.users.id = db.auction.list_user_id 
        LEFT JOIN
            db.review 
            ON auction.list_user_id = db.review.reviewee_id 
        LEFT JOIN
            (
                SELECT
                a.reviewee_id,
                a.stars,
                a.msg 
                FROM
                review a 
                INNER JOIN
                    (
                        SELECT
                            reviewee_id,
                            MAX(stars) as stars 
                        FROM
                            review 
                        GROUP BY
                            reviewee_id 
                    )
                    b 
                    ON a.stars = b.stars 
                GROUP BY
                reviewee_id 
            )
            as best_review 
            ON auction.list_user_id = best_review.reviewee_id 
        LEFT JOIN
            (
                SELECT
                a.reviewee_id,
                a.stars,
                a.msg 
                FROM
                review a 
                INNER JOIN
                    (
                        SELECT
                            reviewee_id,
                            MIN(stars) as stars 
                        FROM
                            review 
                        GROUP BY
                            reviewee_id 
                    )
                    b 
                    ON a.stars = b.stars 
                GROUP BY
                reviewee_id 
            )
            as worst_review 
            ON auction.list_user_id = worst_review.reviewee_id 
        LEFT JOIN
            products 
            ON products.id = auction.product_id 
        LEFT JOIN
            users as bid_user 
            ON bid_user.id = auction.bid_user_id 
        LEFT JOIN
            (
                SELECT
                product_id,
                AVG(price / quantity) as price 
                FROM
                transactions 
                GROUP BY
                product_id
            )
            as prices 
            ON auction.product_id = prices.product_id
    WHERE 
    is_finished = false AND 
    now() > start_date AND 
    now() < end_date
`

module.exports.GET_TRANSACTIONS = `
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
        ON transactions.list_user_id = purchaser_reviews.reviewee_id 
        AND transactions.purchase_user_id = purchaser_reviews.reviewer_id 
        LEFT JOIN
        db.review as lister_reviews 
        ON transactions.purchase_user_id = lister_reviews.reviewee_id 
        AND transactions.list_user_id = lister_reviews.reviewer_id 
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
`

module.exports.GET_FIXED = `
    SELECT
        db.fixed_price.*,
        IF( discount_end IS NOT NULL 
        and now() < discount_end, discount_price, base_price ) as price,
        db.users.username as list_username,
        AVG(db.review.stars) as avglist_user_score,
        bought_history.buy_count as list_user_buy_count,
        sell_history.sell_count as list_user_sell_count,
        products.name as product_name,
        best_review.stars as best_review_rating,
        best_review.msg as best_review_review,
        worst_review.stars as worst_review_rating,
        worst_review.msg as worst_review_review,
        prices.price as avg_sell_price 
    FROM
        db.fixed_price 
        LEFT JOIN
        db.users 
        ON db.users.id = db.fixed_price.list_user_id 
        LEFT JOIN
        db.review 
        ON db.fixed_price.list_user_id = db.review.reviewee_id 
        LEFT JOIN
        (
            SELECT
                purchase_user_id,
                COUNT(*) as buy_count 
            FROM
                transactions 
            GROUP BY
                purchase_user_id 
        )
        as bought_history 
        ON db.fixed_price.list_user_id = bought_history.purchase_user_id 
        LEFT JOIN
        (
            SELECT
                list_user_id,
                COUNT(*) as sell_count 
            FROM
                transactions 
            GROUP BY
                list_user_id 
        )
        as sell_history 
        ON db.fixed_price.list_user_id = sell_history.list_user_id 
        LEFT JOIN
        products 
        ON products.id = fixed_price.product_id 
        LEFT JOIN
        (
            SELECT
                product_id,
                max(date) as date 
            FROM
                transactions 
            GROUP BY
                product_id 
        )
        as last_transaction 
        ON products.id = last_transaction.product_id 
        LEFT JOIN
        (
            SELECT
                a.reviewee_id,
                a.stars,
                a.msg 
            FROM
                review a 
                INNER JOIN
                    (
                    SELECT
                        reviewee_id,
                        MAX(stars) as stars 
                    FROM
                        review 
                    GROUP BY
                        reviewee_id 
                    )
                    b 
                    ON a.stars = b.stars 
            GROUP BY
                reviewee_id 
        )
        as best_review 
        ON db.fixed_price.list_user_id = best_review.reviewee_id 
        LEFT JOIN
        (
            SELECT
                a.reviewee_id,
                a.stars,
                a.msg 
            FROM
                review a 
                INNER JOIN
                    (
                    SELECT
                        reviewee_id,
                        MIN(stars) as stars 
                    FROM
                        review 
                    GROUP BY
                        reviewee_id 
                    )
                    b 
                    ON a.stars = b.stars 
            GROUP BY
                reviewee_id 
        )
        as worst_review 
        ON db.fixed_price.list_user_id = worst_review.reviewee_id 
        LEFT JOIN
        (
            SELECT
                product_id,
                AVG(price / quantity) as price 
            FROM
                transactions 
            GROUP BY
                product_id
        )
        as prices 
        ON fixed_price.product_id = prices.product_id

    WHERE 
`