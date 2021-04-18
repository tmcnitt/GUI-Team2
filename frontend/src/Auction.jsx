import React from 'react';

export const Auction = props => <>

    <h3>Current Bid: <span class="badge bg-success">{props.itemListing.current_bid}</span></h3>
    <p className="lead">Auction End Date: {props.itemListing.end_date}</p>
    <div class="d-grid">
    <button
        type="button"
        className="btn btn-primary btn-lg btn-block mt-4"
        onClick={() => this.onAddClick()}>
        Bid
    </button>
    </div>

</>;
