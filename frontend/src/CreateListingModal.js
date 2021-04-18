import React, { useState } from "react"



function AuctionForm() {



    return (
        <>
            <div class="row g-3 mb-3">
                <div class="col-3">
                    <label for="start_date" class="col-form" value = {this.state.start_date}>Start</label>
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
    )
}

function FixedForm() {
    return (
        <>
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
    )
}

export function CreateListingModal() {




    let [listType, setListType] = useState("auction")

    return (
        <div class="modal fade" id="listingModal" tabindex="-1" aria-labelledby="listingModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="listingModalLabel">Edit Listing</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="row g-3 mb-3">
                                <div class="col-3">
                                    <label for="product" class="col-form-label">Product</label>
                                </div>
                                <div class="col-9">
                                    <input type="password" id="product" class="form-control" />
                                </div>
                            </div>
                            <fieldset class="form-group mb-3">
                                <div class="row">
                                    <legend class="col-form-label col-sm-3 pt-0">Type</legend>
                                    <div class="col-sm-9" onChange={(event) => setListType(event.target.value)}>
                                        <div class="form-check">
                                            <input class="form-check-input" defaultChecked type="radio" name="gridRadios" id="gridRadios1" value="auction" />
                                            <label class="form-check-label" for="gridRadios1">
                                                Auction
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios2" value="fixed" />
                                            <label class="form-check-label" for="gridRadios2">
                                                Fixed Price
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                            {listType == "auction" && <AuctionForm />}
                            {listType == "fixed" && <FixedForm />}
                            <div class="row g-3 mb-3">
                                <div class="col-3">
                                    <label for="description" class="col-form-label">Description</label>
                                </div>
                                <div class="col-9">
                                    <textarea class="form-control" id="description" rows="3"></textarea>
                                </div>
                            </div>

                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    )
}