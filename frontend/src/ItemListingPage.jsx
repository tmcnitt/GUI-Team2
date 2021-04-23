import React, { useContext, useState } from "react";
import { Auction } from "./Auction";
import { Fixed } from "./Fixed";
import { SettingsModal } from "./SettingsModal";
import axios from "axios";
import { AppContext } from "./AppContext";
import { capitalize } from "./utils";

export function ItemListingPage({ listing, setListing, refresh }) {
  let [bannerMessage, setBannerMessage] = useState("")

  let info;
  if (listing.auction_type == "Auction") {
    info = <Auction listing={listing} setListing={setListing} setBannerMessage={setBannerMessage} refresh={refresh}></Auction>;
  } else {
    info = <Fixed listing={listing} setListing={setListing} setBannerMessage={setBannerMessage} refresh={refresh}></Fixed>;
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
      <button
        type="button"
        className="btn btn-secondary m-4 float-end"
        data-bs-toggle="modal"
        data-bs-target="#settingsModal"
      >
        Edit Listing
      </button>
      <SettingsModal
        listing={listing}
        refresh={refresh}
        setListing={setListing}
        reset={() => setListing(null)}
      />
      <div className="jumbotron container bg-light mt-5">
        <img
          className="float-start m-3"
          src={baseURL + "/products/" + listing.product_id}
        ></img>
        <div className="mx-auto">
          <h1 className="display-4">{capitalize(listing.product_name)}</h1>
          <h1>
            <span className="badge badge-success badge-lg"></span>
          </h1>
          <p className="lead">{capitalize(listing.description)}</p>
          <div>{info}</div>
          <div className="float-end"></div>
        </div>
      </div>
    </>
  );
}
