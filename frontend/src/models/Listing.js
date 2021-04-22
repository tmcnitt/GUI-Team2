
export class Listing {
    constructor(item, auction_type, list_user_id, start_date, end_date, current_bid, discount_end, discount_price, base_price, quantity_left, show_user_bid, bid_user_id) {
        this.item = item; 
        this.auction_type = auction_type;
        this.list_user_id = list_user_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.current_bid = current_bid;
        this.discount_end = discount_end;
        this.discount_price = discount_price;
        this.base_price = base_price;
        this.quantity_left = quantity_left;
        this.show_user_bid = show_user_bid;
        this.bid_user_id = bid_user_id;
        
    }
}