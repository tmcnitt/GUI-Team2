import React from "react";
import { FixedForm } from "./FixedForm";
import { AuctionForm } from "./AuctionForm";

export const SettingsModal = (props) => {
  let info;
  if (props.listing.auction_type == "Fixed") {
    info = <FixedForm itemListing={props.listing}></FixedForm>;
  } else if (props.listing.auction_type == "Auction") {
    info = <AuctionForm itemListing={props.listing}></AuctionForm>;
  }

  return (
    <>
      <div
        class="modal fade"
        id="listingModal"
        tabindex="-1"
        aria-labelledby="listingModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="listingModalLabel">
                Edit Listing
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="row g-3 mb-3">
                  <div class="col-3">
                    <label for="product" class="col-form-label">
                      Product
                    </label>
                  </div>
                  <div class="col-9">
                    <input type="password" id="product" class="form-control" />
                  </div>
                </div>
                <fieldset class="form-group mb-3">
                  <div class="row">
                    <legend class="col-form-label col-sm-3 pt-0">Type</legend>

                    <div class="form-check">
                      <input
                        class="form-check-input"
                        defaultChecked
                        type="radio"
                        name="gridRadios"
                        id="gridRadios1"
                        value="auction"
                      />
                      <label class="form-check-label" for="gridRadios1">
                        Auction
                      </label>
                    </div>
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="radio"
                        name="gridRadios"
                        id="gridRadios2"
                        value="fixed"
                      />
                      <label class="form-check-label" for="gridRadios2">
                        Fixed Price
                      </label>
                    </div>
                  </div>
                </fieldset>

                <div>{info}</div>
                <div class="row g-3 mb-3">
                  <div class="col-3">
                    <label for="description" class="col-form-label">
                      Description
                    </label>
                  </div>
                  <div class="col-9">
                    <textarea
                      class="form-control"
                      id="description"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" class="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
