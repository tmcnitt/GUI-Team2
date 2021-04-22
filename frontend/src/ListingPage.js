import React, { useState } from "react";
import './AuctionList.css'
import { CreateListingModal } from "./CreateListingModal";
import { AuctionList } from './AuctionList'
import { ItemListingPage } from "./ItemListingPage";


export function ListingPage({ selling }) {
    let [show, setShow] = useState(false)
    let [listing, setListing] = useState(null)

    if (listing) {
        return (
            <ItemListingPage listing={listing} setListing={setListing} />
        )
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between">
                <h1>Listings</h1>
                <button type="button" className="btn btn-primary" onClick={() => setShow(true)}>
                    Create Listing
                </button>
            </div>
            <CreateListingModal show={show} setShow={setShow} />
            <AuctionList setListing={setListing} selling={selling} />
        </div>
    )
}
