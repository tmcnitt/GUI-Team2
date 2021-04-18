import React from "react";
import { Product } from "./models/Product";
import { Listing } from "./models/Listing";
import { Auction } from "./Auction";
import { Fixed } from "./Fixed";

export class ItemListingPage extends React.Component {
  constructor() {
    super();
    this.item = new Product(
      1,
      "Lumber",
      "The best lumber ever from the rainforest.",
      "https://via.placeholder.com/300",
      "Bid"
    );
    this.state = new Listing(
      this.item,
      1,
      "Lumber",
      "The best lumber ever from the rainforest.",
      "https://via.placeholder.com/300",
      "Bid"
    );
  }

  state = {
    id: "",
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    auctionType: "",
  };

  render() {
    let info;
    if (this.state.auctionType == "Bid") {
      info = <Auction></Auction>;
    } else if (this.state.auctionType == "Buy") {
      info = <Fixed></Fixed>;
    }

    return (
      <>
        <button type="button" className="btn btn-secondary btn-md m-4">
          {" "}
          Back To Listings{" "}
        </button>
        <div class="jumbotron container bg-light mt-5">
          <div class="container-fluid">
            <img
              class="float-left img-thumbnail mr-5 mb-5"
              src={this.state.imageUrl}
            ></img>
            <h1 class="display-4">{this.state.name}</h1>
            <h1>
              <span class="badge badge-success badge-lg">
                {this.state.price}
              </span>
            </h1>
            <p class="lead">{this.state.description}</p>
            <div>{info}</div>
            <button
              type="button"
              className="btn btn-primary btn-lg btn-block mt-4"
              onClick={() => this.onAddClick()}
            >
              {this.state.auctionType}
            </button>
            <div class="clearfix"></div>
          </div>
        </div>
      </>
    );
  }
}
