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
        className="modal fade"
        id="listingModal"
        tabIndex="-1"
        aria-labelledby="listingModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="listingModalLabel">
                Edit Listing
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row g-3 mb-3">
                  <div className="col-3">
                    <label for="product" className="col-form-label">
                      Product
                    </label>
                  </div>
                  <div className="col-9">
                    <input
                      type="password"
                      id="product"
                      className="form-control"
                    />
                  </div>
                </div>
                <fieldset className="form-group mb-3">
                  <div className="row">
                    <legend className="col-form-label col-sm-3 pt-0">
                      Type
                    </legend>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        defaultChecked
                        type="radio"
                        name="gridRadios"
                        id="gridRadios1"
                        value="auction"
                      />
                      <label className="form-check-label" for="gridRadios1">
                        Auction
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="gridRadios"
                        id="gridRadios2"
                        value="fixed"
                      />
                      <label className="form-check-label" for="gridRadios2">
                        Fixed Price
                      </label>
                    </div>
                  </div>
                </fieldset>

                <div>{info}</div>
                <div className="row g-3 mb-3">
                  <div className="col-3">
                    <label for="description" className="col-form-label">
                      Description
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      className="form-control"
                      id="description"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
