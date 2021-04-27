import React, { useState, useContext } from "react";
import axios from "axios"
import { AppContext } from "./AppContext.js";
import { axiosJWTHeader } from "./utils";

export const Fixed = (props) => {
  let [quantity, setQuantity] = useState(0);

  const { baseURL, JWT, user } = useContext(AppContext);

  let checkout = (single) => {
    let qty = quantity;
    if (single) {
      qty = 1
    }

    props.setListing(
      Object.assign({}, props.listing, {
        quantity: props.listing.quantity - qty,
      })
    );

    axios.post(
      baseURL + "/fixed/" + `${props.listing.id}` + "/buy",
      { purchase_quantity: qty },
      { headers: axiosJWTHeader(JWT) }
    ).then((r) => {
      setTimeout(() => {
        props.setBannerMessage("")
      }, 5000)

      props.setBannerMessage(r.data.msg)
      props.refresh()
    }).catch((r) => {

      setTimeout(() => {
        props.setBannerMessage("")
      }, 5000)

      props.setBannerMessage(r.data.msg)
      props.refresh()
    });
  };

  if (props.listing.quantity == 0 && user.id != props.listing.list_user_id) {
    setTimeout(() => {
      props.setListing(null);
    }, 1000)
  }

  let qty = null;
  let buy = (
    <button
      type="button"
      className="btn btn-primary btn-lg btn-block mt-4"
      onClick={() => checkout(true)}
    >
      Buy
    </button>
  );
  if (props.listing.quantity > 1) {
    qty = <p className="lead">Quantity Left: {props.listing.quantity}</p>;
    buy = (
      <div className="container">
        <div className="col-3 mx-auto">
          <div className="mb-0 text-center">
            {qty}
          </div>
        </div>
        <div className="col-3 mx-auto">
          <div className="input-group mb-3">
            <input
              type="number"
              max={props.listing.quantity}
              min={1}
              className="form-control"
              placeholder="Quantity"
              aria-describedby="button-addon2"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              id="button-addon2"
              onClick={() => checkout()}
            >
              Buy
            </button>
          </div>
        </div>

      </div>
    );
  }



  return (
    <>

      <div className="d-grid">{buy}</div>
    </>
  );
};
