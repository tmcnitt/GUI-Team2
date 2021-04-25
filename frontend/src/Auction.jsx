import React, { useEffect, useState, useContext } from "react";
import { timeLeft } from "./utils";
import { axiosJWTHeader } from "./utils";
import axios from "axios";
import { AppContext } from "./AppContext.js";

export const Auction = (props) => {
  let [remain, setRemain] = useState(null);

  useEffect(() => {
    setRemain(timeLeft(props.listing.end_date));
    const timer = setTimeout(() => {
      setRemain(timeLeft(props.listing.end_date));
    }, 1000);

    if (new Date(props.listing.end_date) < new Date()) {
      props.setListing(null);
    }

    return () => clearTimeout(timer);
  });

  const { baseURL, JWT, user } = useContext(AppContext);

  const onBidButton = (new_bid) => {
    props.setListing(
      Object.assign({}, props.listing, {
        current_bid: new_bid,
        bid_username: user.username,
      })
    );

    axios
      .post(
        baseURL + "/auctions/" + `${props.listing.id}` + "/bid",
        { new_bid },
        { headers: axiosJWTHeader(JWT) }
      )
      .then((r) => {
        setTimeout(() => {
          props.setBannerMessage("");
        }, 5000);

        props.setBannerMessage(r.data.msg);
        props.refresh();
      })
      .catch((r) => {
        setTimeout(() => {
          props.setBannerMessage("");
        }, 5000);

        props.setBannerMessage(r.data.msg);
        props.refresh();
      });
  };

  let username = null;
  if (props.listing.bid_username) {
    username = <>by {props.listing.bid_username}</>;
  }

  return (
    <>
      <h3>
        Current Bid:{" "}
        <span className="badge bg-success">
          ${props.listing.current_bid} {username}
        </span>
      </h3>
      <p className="lead">Time Remaining: {remain}</p>
      <div className="d-grid">
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
