import React, { useEffect, useState, useContext } from "react";
import { timeLeft } from "./utils";
import axios from "axios"
import { axiosJWTHeader } from './utils'
import { AppContext } from "./AppContext.js";

export const Auction = (props) => {
  let [remain, setRemain] = useState(null);
  const { baseURL, JWT } = useContext(AppContext);
  let url = "http://localhost:3005/";

  useEffect(() => {
    setRemain(timeLeft(props.listing.end_date));
    const timer = setTimeout(() => {
      setRemain(timeLeft(props.listing.end_date));
    }, 1000);

    return () => clearTimeout(timer);
  });

  const onBidButton = (new_bid) => {
    console.log(new_bid);
    props.update(props.listing, new_bid, props.listing.bid_username);
    axios.post(baseURL + "/auctions/" + `${props.listing.id}` +"/bid", {new_bid}, { headers: axiosJWTHeader(JWT) });

}


  let username = null;
  if (props.listing.bid_username) {
    username = <>by {props.listing.bid_username}</>;
  }

  return (
    <>
      <h3>
        Current Bid:{" "}
        <span class="badge bg-success">
          ${props.listing.current_bid} {username}
        </span>
      </h3>
      <p className="lead">Time Remaining: {remain}</p>
      <div class="d-grid">
        <button
          type="button"
          className="btn btn-primary btn-lg btn-block mt-4"
          onClick={() => onBidButton(props.listing.current_bid + 1)}
        >
          Bid
        </button>
      </div>
    </>
  );
};
