import React, { useState, useContext } from "react";
import { FixedSettingsForm } from "./FixedSettingsForm";
import { AuctionSettingsForm } from "./AuctionSettingsForm";
import { ConfirmStopModal } from "./ConfirmStopModal";
import { axiosJWTHeader, dateToISOLikeButLocal } from "./utils";
import axios from "axios";
import { AppContext } from "./AppContext.js";

export const SettingsModal = (props) => {
  let { baseURL, JWT } = useContext(AppContext);

  const defaultValues = {
    description: props.listing.description,
    start_date: props.listing.start_date
      ? dateToISOLikeButLocal(new Date(props.listing.start_date))
      : "",
    end_date: props.listing.end_date
      ? dateToISOLikeButLocal(new Date(props.listing.end_date))
      : "",
    show_user_bid: props.listing.show_user_bid,
    base_price: props.listing.base_price,
    quantity: props.listing.quantity,

    discount_end: props.listing.discount_end
      ? dateToISOLikeButLocal(new Date(props.listing.discount_end))
      : "",

    discount_price: props.listing.discount_price || props.listing.base_price,
  };

  let [values, setValues] = useState(defaultValues);

  const handleInputChange = (e) => {
    let { name, value, checked } = e.target;
    if (e.target.type === "checkbox") {
      value = checked;
    }
    setValues({ ...values, [name]: value });
  };

  let info;
  if (props.listing.auction_type == "Fixed") {
    info = (
      <FixedSettingsForm
        values={values}
        handleInputChange={handleInputChange}
      ></FixedSettingsForm>
    );
  } else if (props.listing.auction_type == "Auction") {
    info = (
      <AuctionSettingsForm
        values={values}
        handleInputChange={handleInputChange}
        defaultValues={defaultValues}
      ></AuctionSettingsForm>
    );
  }

  const cancelListing = () => {
    const handler = () => {
      props.refresh();
      props.reset();
    }

    if (props.listing.auction_type == "Fixed") {
      axios.delete(baseURL + "/fixed/" + `${props.listing.id}`, {
        headers: axiosJWTHeader(JWT),
      }).then(handler);
    } else {
      axios.delete(baseURL + "/auctions/" + `${props.listing.id}`, {
        headers: axiosJWTHeader(JWT),
      }).then(handler);
    }
  };

  const submit = () => {
    const handler = () => {
      props.refresh()
      props.setListing(Object.assign({}, props.listing, values))
    }

    if (props.listing.auction_type == "Fixed") {
      axios.put(baseURL + "/fixed/" + `${props.listing.id}`, values, {
        headers: axiosJWTHeader(JWT),
      }).then(handler);
    } else {
      axios.put(baseURL + "/auctions/" + `${props.listing.id}`, values, {
        headers: axiosJWTHeader(JWT),
      }).then(handler);
    }
  };

  return (
    <>
      <ConfirmStopModal confirm={cancelListing} />
      <div
        className="modal fade"
        id="settingsModal"
        tabindex="-1"
        aria-labelledby="settingModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="settingModalLabel">
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
                {info}
                <div className="row g-3 mb-3">
                  <div className="col-3">
                    <label htmlFor="description" className="col-form-label">
                      Description
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      className="form-control"
                      name="description"
                      id="description"
                      rows="3"
                      onChange={handleInputChange}
                      value={values.description}
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
                data-bs-toggle="modal"
                data-bs-target="#settingsModal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                data-bs-toggle="modal"
                data-bs-target="#settingsModal"
                onClick={() => submit()}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                data-bs-toggle="modal"
                data-bs-target="#settingsModal"
                data-bs-toggle="modal"
                data-bs-target="#confirmModal"
              >
                Stop Listing
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
