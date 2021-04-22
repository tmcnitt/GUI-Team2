import React from "react";

export const FixedForm = (props) => (
  <>
    <div className="row g-3 mb-1">
      <div className="col-3">
        <label for="price_per_unit" className="col-form-label">
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
            id="price_per_unit"
            className="form-control"
            aria-describedby="basic-addon1"
          />
        </div>
      </div>
    </div>
    <div className="row g-3 mb-1">
      <div className="col-3">
        <label for="units" className="col-form-label">
          Units Avilable
        </label>
      </div>
      <div className="col-9">
        <div className="input-group mb-3">
          <input
            type="number"
            id="units"
            className="form-control"
            aria-describedby="basic-addon1"
          />
        </div>
      </div>
    </div>
  </>
);
