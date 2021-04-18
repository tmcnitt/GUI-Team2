import React, { useState, useRef, useLayoutEffect } from "react";

import './AuctionList.css'
import listings from "./dummyData.js";
import { CreateListingModal } from "./CreateListingModal";


function AuctionItem(props) {
  let price = props.listing.base_price;
  if (!price) {
    price = props.listing.current_bid
  }

  return (
    <tr className="itemRow">
      <th scope="row">{props.listing.item.name}</th>
      <td>{props.listing.auction_type}</td>
      <td>{price}</td>
      <td>{props.listing.end_date}</td>
      <td>4.5/5</td>
    </tr>
  );
}


export function AuctionList(props) {

  let items = [];
  listings.forEach(listing => {
    items.push((
      <AuctionItem listing={listing} />
    ))
  })

  const table = useRef();

  useLayoutEffect(() => {
    window.$(table.current).DataTable()
  }, [])

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between">
        <h1>Listings</h1>
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#listingModal">
          Create Listing
        </button>
      </div>
      <CreateListingModal />
      <div className="p-2 mt-5">
        <table className="table table-striped" ref={table}>
          <thead className="thead-dark">
            <tr>
              <th scope="col">Item Name</th>
              <th scope="col">Listing Type</th>
              <th scope="col">Price</th>
              <th scope="col">Time Left</th>
              <th scope="col">User Reviews</th>
            </tr>
          </thead>
          <tbody>
            {items}
          </tbody>
        </table>
      </div>
    </div>
  )
}
