import React from 'react';

export const Bulk = props => <>

    <h3>Price: <span class="badge bg-success">{props.itemListing.discount_price}</span></h3>
    <p className="lead">Quantity Left: {props.itemListing.quantity_left}</p>
    <p className="lead">Discount End Date: {props.itemListing.discount_end}</p>
    <div class="d-grid">
    <button
        type="button"
        className="btn btn-primary btn-lg btn-block mt-4"
        onClick={() => this.onAddClick()}>
        Buy
    </button>
    </div>

</>;
