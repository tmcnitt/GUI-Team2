import React from "react";
import './AuctionList.css'

function AuctionItem(props) {
  return (<div>
            <img src="https://via.placeholder.com/300"></img>
            <span><p>Current Bid: {props.current_bid}</p></span>
            <span><p>Latest Bidder: {props.latest_bidder}</p></span>
            <span><p>End date: {props.end_date}</p></span>
            <span><p>Description: {props.description}</p></span>
         </div>);
}

export default AuctionItem;