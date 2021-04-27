import React from "react";
import { dateToISOLikeButLocal } from "./utils";

export function FixedSettingsForm({ values, handleInputChange }) {
  const setNow = (name) => {
    handleInputChange({
      target: {
        name,
        value: dateToISOLikeButLocal(new Date()),
      },
    });
  };

  const setTotalPrice = (e) => {
    handleInputChange({
      target: {
        name: 'base_price',
        value: e.target.value / values.quantity,
      },
    });
  }

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-3">
          <label htmlFor="discount_end" className="col-form-label">
            Discount End
          </label>
        </div>
        <div className="col-7">
          <input
            type="datetime-local"
            name="discount_end"
            id="discount_end"
            onChange={handleInputChange}
            value={values.discount_end}
            className="form-control"
          />
        </div>
        <div className="col-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setNow("discount_end")}
          >
            Now
          </button>
        </div>
        <div className="col-5">
          <label htmlFor="discount_price" className="col-form-label">
            Discount Price
          </label>
        </div>
        <div className="col-7">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              $
            </span>
            <input
              type="number"
              name="discount_price"
              id="discount_price"
              className="form-control"
              onChange={handleInputChange}
              value={values.discount_price}
              aria-describedby="basic-addon1"
            />
          </div>
        </div>
        <div className="col-5">
          <label htmlFor="base_price" className="col-form-label">
            Discounted Total Cost
          </label>
        </div>
        <div className="col-7">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              $
            </span>
            <input
              type="number"
              name="base_price"
              id="base_price"
              className="form-control"
              value={values.discount_price * values.quantity}
              aria-describedby="basic-addon1"
              disabled={"true"}
            />
          </div>
        </div>
        <hr />
        <div className="col-5">
          <label htmlFor="base_price" className="col-form-label">
            Price Per Unit
          </label>
        </div>
        <div className="col-7">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              $
            </span>
            <input
              type="number"
              name="base_price"
              id="base_price"
              className="form-control"
              onChange={handleInputChange}
              value={values.base_price}
              aria-describedby="basic-addon1"
            />
          </div>
        </div>
      </div>
      <div className="row g-3 mb-1">
        <div className="col-5">
          <label htmlFor="quantity" className="col-form-label">
            Units Available
          </label>
        </div>
        <div className="col-7">
          <div className="input-group mb-3">
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="form-control"
              onChange={handleInputChange}
              value={values.quantity}
            />
          </div>
        </div>
      </div>
      <div className="row g-3 mb-1">
        <div className="col-5">
          <label htmlFor="quantity" className="col-form-label">
            Total Cost
          </label>
        </div>
        <div className="col-7">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              $
            </span>
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="form-control"
              onChange={setTotalPrice}
              value={values.quantity * values.base_price}
              aria-describedby="basic-addon1"
            />
          </div>
        </div>
      </div>
    </>
  );
}
