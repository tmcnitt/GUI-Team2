import React from "react";
import { Product } from "./models/Product";
import { Listing } from "./models/Listing";
import { Auction } from "./Auction";
import { Fixed } from "./Fixed";
import { Bulk } from "./Bulk";
import { SettingsModal } from "./SettingsModal";

export class ItemListingPage extends React.Component {
  constructor() {
    super();

    this.item = new Product(
      1,
      "Lumber",
      "The best lumber ever from the rainforest.",
      "https://via.placeholder.com/300"
    );
    this.state = new Listing(
      this.item,
      "Auction",
      1,
      "1-1-2021",
      "1-3-2021",
      7.99,
      "",
      "",
      "",
      ""
    );
  }

  render() {
    let info;
    if (this.state.auction_type == "Auction") {
      info = <Auction itemListing={this.state}></Auction>;
    } else if (this.state.auction_type == "Fixed") {
      info = <Fixed itemListing={this.state}></Fixed>;
    } else if (this.state.auction_type == "Bulk") {
      info = <Bulk itemListing={this.state}></Bulk>;
    }

    return (
      <>
        <button
          type="button"
          className="btn btn-secondary btn-md m-4 float-none"
        >
          Back To Listings
        </button>

        <button
          type="button"
          class="btn btn-secondary m-4 float-end"
          data-bs-toggle="modal"
          data-bs-target="#listingModal"
        >
          Edit Listing
        </button>
        <SettingsModal listing={this.state} />
        <div class="jumbotron container bg-light mt-5">
          <img class="float-start m-3" src={this.state.item.imageUrl}></img>
          <div class="mx-auto">
            <h1 class="display-4">{this.state.item.name}</h1>
            <h1>
              <span class="badge badge-success badge-lg">
                {this.state.item.price}
              </span>
            </h1>
            <p class="lead">{this.state.item.description}</p>
            <div>{info}</div>
            <div class="float-end"></div>
          </div>
        </div>
      </>
    );
  }
}
