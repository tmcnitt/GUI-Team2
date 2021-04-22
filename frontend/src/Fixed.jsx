import React, { useState } from "react";

export const Fixed = (props) => {
  let discount = null;
  if (props.listing.discount_end) {
    if (new Date(props.listing.discount_end) > new Date()) {
      discount = (
        <p className="lead">Discount End Date: {props.listing.discount_end}</p>
      );
    }

  }

  let qty = null;
  let buy = (
    <button
      type="button"
      className="btn btn-primary btn-lg btn-block mt-4"
      onClick={() => this.onAddClick()}
    >
      Buy
    </button>
  );
  if (props.listing.quantity > 1) {
    qty = <p className="lead">Quantity Left: {props.listing.quantity}</p>;
    buy = (
      <div className="container">
        <div className="col-3 mx-auto">
          <div className="input-group mb-3">
            <input
              type="number"
              max={props.listing.quantity}
              min={1}
              className="form-control"
              placeholder="Quantity"
              aria-describedby="button-addon2"
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              id="button-addon2"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    );
  }

  let price = props.listing.base_price;
  if (new Date() < new Date(props.listing.discount_end)) {
    price = props.listing.discount_price
  }

  return (
    <>
      <h3>
        Price: <span className="badge bg-success">${price}</span>
      </h3>
      {qty}
      {discount}
      <div className="d-grid">{buy}</div>
    </>
  );
};
