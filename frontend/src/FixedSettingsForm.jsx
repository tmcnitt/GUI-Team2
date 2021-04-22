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

  return (
    <>
      <div className="row g-3 mb-1">
        <div className="col-3">
          <label htmlFor="discount_start" className="col-form-label">
            Discount Start
          </label>
        </div>
        <div className="col-7">
          <input
            type="datetime-local"
            name="discount_start"
            id="discount_start"
            onChange={handleInputChange}
            value={values.discount_start}
            className="form-control"
          />
        </div>
        <div className="col-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setNow("discount_start")}
          >
            Now
          </button>
        </div>
      </div>
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
        <div className="col-3">
          <label htmlFor="discount_price" className="col-form-label">
            Discount Price
          </label>
        </div>
        <div className="col-9">
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
        <div className="col-3">
          <label htmlFor="base_price" className="col-form-label">
            Price Per Unit
          </label>
        </div>
        <div className="col-9">
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
        <div className="col-3">
          <label htmlFor="quantity" className="col-form-label">
            Units Avilable
          </label>
        </div>
        <div className="col-9">
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
    </>
  );
}
