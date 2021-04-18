import React from 'react';

export const AuctionForm = props => <>
    <div class="row g-3 mb-3">
        <div class="col-3">
            <label for="start_date" class="col-form">Start</label>
        </div>
        <div class="col-9">
            <input type="datetime-local" id="start_date" class="form-control" />
        </div>
    </div>
    <div class="row g-3 mb-3">
        <div class="col-3">
            <label for="end_time" class="col-form-label">End</label>
        </div>
        <div class="col-9">
            <input type="datetime-local" id="end_time" class="form-control" />
        </div>
    </div>

    <div class="row g-3 mb-1">
        <div class="col-3">
            <label for="start_bid" class="col-form-label">Starting Bid</label>
        </div>
        <div class="col-9">
            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">$</span>
                <input type="number" id="start_bid" class="form-control" aria-describedby="basic-addon1" />
            </div>

        </div>

    </div>
    <div class="row mb-3">
        <div className="col-5">
            <label for="display_bid" class="col-form-label">Display Leading User?</label>
        </div>
        <div class="col-7">
            <div class="form-check form-check-inline col-form-label">
                <input class="form-check-input" id="display_bid" type="checkbox" id="gridCheck1" />
            </div>
        </div>
    </div>

</>