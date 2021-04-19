import React, { useState, useRef, useEffect, useContext, } from "react";

import './AuctionList.css'
import axios from "axios";
import { AppContext } from "./AppContext.js";
import { capitalize, relativeTime } from './utils'


function AuctionItem(props) {

  let [compare, setCompare] = useState(0)

  useEffect(() => {
    props.redraw()
  })

  let reviews = "None"
  if (props.listing.avglist_user_score) {
    reviews = <p>{props.listing.avglist_user_score.toFixed(1)} / 5</p>
  }

  let quantity = "1"
  let price = props.listing.current_bid
  if (props.listing.auction_type == "Fixed") {
    quantity = props.listing.quantity
    price = props.listing.single_price + " Each"
  }

  let compareBtn = <button type="button" className="form-control btn btn-primary" onClick={() => setCompare("1")}>Add to Compare</button>
  if (compare == "1") {
    compareBtn = <button type="button" className="form-control btn btn-primary" onClick={() => setCompare("0")}>Remove from Compare</button>
  }

  return (
    <tr className="itemRow" onClick={() => props.setListing(props.listing)}>
      <th scope="row">{capitalize(props.listing.product_name)}</th>
      <td>{props.listing.auction_type}</td>
      <td>${price}</td>
      <td>{quantity}</td>
      <td>{props.listing.end_date ? relativeTime(props.listing.end_date) : "-"}</td>
      <td>{reviews}</td>
      <td>{compare.toString()}</td>
      <td>{compareBtn}</td>
    </tr>
  );
}


export function AuctionList({ selling, setListing }) {
  let [items, setItems] = useState([]);


  const { baseURL, user } = useContext(AppContext);

  let filter = false

  const redraw = () => {
    let dTable = window.$(table.current).DataTable()
    if (dTable) {
      dTable.rows().invalidate().draw()
    }
  }

  useEffect(() => {
    const formatAuctions = (r) => {
      let items = []
      r.data.data.forEach(auction => {
        auction.auction_type = "Auction"
        items.push(
          <AuctionItem key={auction.id} listing={auction} setListing={setListing} redraw={redraw} />
        )
      })
      return items
    }

    const formatFixed = (r) => {
      let items = []
      r.data.data.forEach(auction => {
        auction.auction_type = "Fixed"
        items.push(
          <AuctionItem key={auction.id} listing={auction} setListing={setListing} redraw={redraw} />
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
      window.$(table.current).DataTable({
        dom: 'Bfrtip',
        columnDefs: [
          {
            "targets": [6],
            "visible": false,
            "searchable": true,
          }
        ],
        buttons: [
          {
            text: 'Toggle Compare',
            action: function (e, dt, node, config) {
              filter = !filter
              if (filter) {
                dt.column(6).search("1").draw()
              } else {
                dt.column(6).search("").draw()
              }
            }
          }
        ]
      })
    }))

  }, [])

  const table = useRef();

  return (
    <div className="p-2 mt-5">
      <table className="table table-striped" ref={table}>
        <thead className="thead-dark">
          <tr>
            <th scope="col">Item Name</th>
            <th scope="col">Listing Type</th>
            <th scope="col">Price</th>
            <th scope="col">Quantity</th>
            <th scope="col">Ends</th>
            <th scope="col">Seller Reviews</th>
            <th scope="col">Hidden</th>
            <th scope="col">Compare</th>
          </tr>
        </thead>
        <tbody>
          {items}
        </tbody>
      </table>
    </div>
  )
}
