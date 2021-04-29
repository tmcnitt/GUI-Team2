import React, { useContext, useState } from "react";
import { Auction } from "./Auction";
import { Fixed } from "./Fixed";
import { SettingsModal } from "./SettingsModal";
import axios from "axios";
import { AppContext } from "./AppContext";
import { capitalize } from "./utils";

export function ItemListingPage({ listing, setListing, refresh }) {
  let [bannerMessage, setBannerMessage] = useState("");

  let { user } = useContext(AppContext);

  let info;
  let price;
  if (listing.auction_type == "Auction") {
    info = (
      <Auction
        listing={listing}
        setListing={setListing}
        setBannerMessage={setBannerMessage}
        refresh={refresh}
      ></Auction>

    );

    //Get the current winner
    let username = null;
    if (listing.bid_username) {
      username = <>by {listing.bid_username}</>;
    }

    //Set the info
    price = (<h3>
      Current Bid:{" "}
      <span className="badge bg-success">
        ${listing.current_bid} {username}
      </span>
    </h3>)

  } else {
    info = (
      <Fixed
        listing={listing}
        setListing={setListing}
        setBannerMessage={setBannerMessage}
        refresh={refresh}
      ></Fixed>
    );

    //Get the current rice
    price = listing.base_price;
    if (new Date() < new Date(listing.discount_end)) {
      price = listing.discount_price;
    }

    price = (<>
      <h3>
        Price: <span className="badge bg-success">${price}</span>
      </h3>
    </>
    )
  }

  let { baseURL } = useContext(AppContext);

  let banner = <></>;
  if (bannerMessage) {
    banner = (
      <div className="alert alert-primary" role="alert">
        {bannerMessage}
      </div>
    );
  }

  let edit = null;
  if (user.id == listing.list_user_id) {
    edit = (
      <button
        type="button"
        className="btn btn-secondary m-4 float-end"
        data-bs-toggle="modal"
        data-bs-target="#settingsModal"
      >
        Edit Listing
      </button>
    );
  }

  let rating = null;
  if (listing.avglist_user_score) {
    rating = (
      <p>Seller Average Rating: {listing.avglist_user_score.toFixed(1)}/5</p>
    )
  } else {
    rating = (
      <p>No reviews for this seller</p>
    )
  }

  let reviews = [];
  if (listing.best_review_rating) {
    reviews.push(
      <>
        <p>Best Rating:{""} {listing.best_review_rating}/5</p>
        <p>Best review:{""} {listing.best_review_review.slice(0, 40)}</p>
      </>
    )
  }

  if (listing.worst_review_rating && listing.worst_review_rating != listing.best_review_rating) {
    reviews.push(
      <>
        <p>Worst Rating:{""} {listing.worst_review_rating}/5</p>
        <p>Worst review:{""} {listing.worst_review_review.slice(0, 40)}</p>
      </>
    )
  }

  // {listing.item.price}
  return (
    <>
      {banner}
      <button
        type="button"
        className="btn btn-secondary btn-md m-4 float-none"
        onClick={() => setListing(null)}
      >
        Back To Listings
      </button>
      {edit}
      <SettingsModal
        listing={listing}
        refresh={refresh}
        setListing={setListing}
        reset={() => setListing(null)}
      />
      <div className="jumbotron container bg-light mt-5">
        <div className="container mt-3">
          <div className="row">
            <div className="col-4">
              <img
                className="img-thumbnail"
                src={baseURL + "/products/" + listing.product_id}
              ></img>
            </div>
            <div className="col-4">
              <h1 className="display-4">{capitalize(listing.product_name)}</h1>
              <h1>
                <span className="badge badge-success badge-lg"></span>
              </h1>
              <p className="lead">{capitalize(listing.description)}</p>
              {price}
              <div>
              </div>
            </div>
            <div className="col-4">
              <h5>Seller Information</h5>
              {rating}
              {reviews}
            </div>
          </div>
          <div className="row">
            {info}
          </div>
        </div>
      </div>
    </>
  );
}
