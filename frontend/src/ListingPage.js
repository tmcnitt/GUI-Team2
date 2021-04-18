import React, { useState } from "react";

import './AuctionList.css'
import { CreateListingModal } from "./CreateListingModal";
import { AuctionList } from './AuctionList'


export function ListingPage() {
    let [show, setShow] = useState(false)

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between">
                <h1>Listings</h1>
                <button type="button" class="btn btn-primary" onClick={() => setShow(true)}>
                    Create Listing
                </button>
            </div>
            <CreateListingModal show={show} setShow={setShow} />
            <AuctionList />
        </div>
    )
}
