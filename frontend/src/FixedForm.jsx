import React from 'react';

export const FixedForm = props => <>

    <div class="row g-3 mb-1">
        <div class="col-3">
            <label for="price_per_unit" class="col-form-label">Price Per Unit</label>
        </div>
        <div class="col-9">
            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">$</span>
                <input type="number" id="price_per_unit" class="form-control" aria-describedby="basic-addon1" />
            </div>

        </div>

    </div>
    <div class="row g-3 mb-1">
        <div class="col-3">
            <label for="units" class="col-form-label">Units Avilable</label>
        </div>
        <div class="col-9">
            <div class="input-group mb-3">
                <input type="number" id="units" class="form-control" aria-describedby="basic-addon1" />
            </div>

        </div>

    </div>


</>