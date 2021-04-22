import React, { useEffect, useState } from "react";
import { timeLeft } from "./utils";

export const Auction = (props) => {
  let [remain, setRemain] = useState(null);

  useEffect(() => {
    setRemain(timeLeft(props.listing.end_date));
    const timer = setTimeout(() => {
      setRemain(timeLeft(props.listing.end_date));
    }, 1000);

    return () => clearTimeout(timer);
  });

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
          onClick={() => this.onAddClick()}
        >
          Bid
        </button>
      </div>
    </>
  );
};
