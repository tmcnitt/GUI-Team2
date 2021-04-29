import React from "react";
import { dateToISOLikeButLocal } from "./utils";

export function AuctionSettingsForm({ defaultValues, values, handleInputChange }) {
  const setNow = () => {
    handleInputChange({
      target: { name: "start_date", value: dateToISOLikeButLocal(new Date()) },
    });
  };

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-3">
          <label htmlFor="start_date" className="col-form-label">
            Start
          </label>
        </div>
        <div className="col-7">
          <input
            type="datetime-local"
            name="start_date"
            id="start_date"
            onChange={handleInputChange}
            value={values.start_date}
            className="form-control"
          />
        </div>
        <div className="col-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setNow()}
          >
            Now
          </button>
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-3">
          <label htmlFor="end_date" className="col-form-label">
            End
          </label>
        </div>

        <div className="col-9">
          <input
            type="datetime-local"
            name="end_date"
            id="end_date"
            onChange={handleInputChange}
            min={defaultValues.end_date}
            value={values.end_date}
            className="form-control"
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-5">
          <label htmlFor="show_user_bid" className="col-form-label">
            Display Leading User?
          </label>
        </div>
        <div className="col-7">
          <div className="form-check form-check-inline col-form-label">
            <input
              className="form-check-input"
              name="show_user_bid"
              id="show_user_bid"
              onChange={handleInputChange}
              checked={values.show_user_bid}
              type="checkbox"
            />
          </div>
        </div>
      </div>
    </>
  );
}
