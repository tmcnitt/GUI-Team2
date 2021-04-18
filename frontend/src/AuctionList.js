import React, { useState, useRef, useEffect, useContext, useLayoutEffect } from "react";

import './AuctionList.css'
import listings from "./dummyData.js";
import { CreateListingModal } from "./CreateListingModal";
import axios from "axios";
import { AppContext } from "./AppContext.js";
import { capitalize, relativeTime } from './utils'


function AuctionItem(props) {

  let reviews = "None"
  if (props.listing.avglist_user_score) {
    reviews = <p>{props.listing.avglist_user_score.toFixed(1)} / 5</p>
  }

  let price = props.listing.current_bid
  if (props.listing.auction_type == "Fixed") {
    price = props.listing.single_price + " Each"
  }

  return (
    <tr className="itemRow">
      <th scope="row">{capitalize(props.listing.product_name)}</th>
      <td>{props.listing.auction_type}</td>
      <td>${price}</td>
      <td>{props.listing.end_date ? relativeTime(props.listing.end_date) : "-"}</td>
      <td>{reviews}</td>
    </tr>
  );
}


export function AuctionList({ selling }) {
  let [products, setProducts] = useState(null);
  let [items, setItems] = useState([]);

  const { baseURL, user } = useContext(AppContext);

  useEffect(() => {
    const formatAuctions = (r) => {
      let items = []
      r.data.data.forEach(auction => {
        auction.auction_type = "Auction"
        items.push(
          <AuctionItem key={auction.id} listing={auction} />
        )
      })
      return items
    }

    const formatFixed = (r) => {
      let items = []
      r.data.data.forEach(auction => {
        auction.auction_type = "Fixed"
        items.push(
          <AuctionItem key={auction.id} listing={auction} />
        )
      })
      return items
    }

    let mod = ""
    if (selling) {
      mod = "/" + user.id
    }
    axios.all([
      axios.get(baseURL + "/auctions" + mod),
      axios.get(baseURL + "/fixed" + mod)
    ]).then(axios.spread((auctions, fixed) => {
      setItems(formatAuctions(auctions).concat(formatFixed(fixed)))
      window.$(table.current).DataTable()
    }))

  }, [products])

  const table = useRef();


  return (
    <div className="p-2 mt-5">
      <table className="table table-striped" ref={table}>
        <thead className="thead-dark">
          <tr>
            <th scope="col">Item Name</th>
            <th scope="col">Listing Type</th>
            <th scope="col">Price</th>
            <th scope="col">Ends</th>
            <th scope="col">Seller Reviews</th>
          </tr>
        </thead>
        <tbody>
          {items}
        </tbody>
      </table>
    </div>
  )
}
