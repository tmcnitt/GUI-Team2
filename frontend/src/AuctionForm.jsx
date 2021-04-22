import React from "react";

export const AuctionForm = (props) => (
  <>
    <div className="row g-3 mb-3">
      <div className="col-3">
        <label for="start_date" className="col-form">
          Start
        </label>
      </div>
      <div className="col-9">
        <input type="datetime-local" id="start_date" className="form-control" />
      </div>
    </div>
    <div className="row g-3 mb-3">
      <div className="col-3">
        <label for="end_time" className="col-form-label">
          End
        </label>
      </div>
      <div className="col-9">
        <input type="datetime-local" id="end_time" className="form-control" />
      </div>
    </div>

    <div className="row g-3 mb-1">
      <div className="col-3">
        <label for="start_bid" className="col-form-label">
          Starting Bid
        </label>
      </div>
      <div className="col-9">
        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon1">
            $
          </span>
          <input
            type="number"
            id="start_bid"
            className="form-control"
            aria-describedby="basic-addon1"
          />
        </div>
      </div>
    </div>
    <div className="row mb-3">
      <div className="col-5">
        <label for="display_bid" className="col-form-label">
          Display Leading User?
        </label>
      </div>
      <div className="col-7">
        <div className="form-check form-check-inline col-form-label">
          <input
            className="form-check-input"
            id="display_bid"
            type="checkbox"
            id="gridCheck1"
          />
        </div>
      </div>
    </div>
  </>
);
