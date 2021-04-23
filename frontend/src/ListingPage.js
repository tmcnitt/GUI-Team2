import React, { useState, useContext, useEffect } from "react";
import './AuctionList.css'
import { CreateListingModal } from "./CreateListingModal";
import { AuctionList, AuctionItem } from './AuctionList'
import { ItemListingPage } from "./ItemListingPage";
import { AppContext } from "./AppContext.js";
import axios from "axios";
import { axiosJWTHeader } from './utils'

export function ListingPage({ selling }) {
    const { baseURL, user, JWT } = useContext(AppContext);

    let [show, setShow] = useState(false)
    let [listing, setListing] = useState(null)
    let [items, setItems] = useState({ 'auctions': [], 'fixed': [] });

    const getListings = () => {
        let mod = ""
        if (selling) {
            mod = "/" + user.id
        }

        axios.all([
            axios.get(baseURL + "/auctions" + mod, { headers: axiosJWTHeader(JWT) }),
            axios.get(baseURL + "/fixed" + mod, { headers: axiosJWTHeader(JWT) })
        ]).then(axios.spread((auctions, fixed) => {
            setItems({ 'auctions': auctions.data.data, 'fixed': fixed.data.data })
        }))
    }

    useEffect(() => {
        getListings()
    }, [])

    if (listing) {
        return (
            <ItemListingPage listing={listing} setListing={setListing} refresh={getListings} />
        )
    }

    //When key changes, the component is destroyed and rerendered
    //We do this so we can resync state with datatables
    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between">
                <h1>Listings</h1>
                <button type="button" className="btn btn-primary" onClick={() => setShow(true)}>
                    Create Listing
                </button>
            </div>
            <CreateListingModal show={show} setShow={setShow} refresh={getListings} />
            <AuctionList key={items.auctions.length + items.fixed.length} listings={items} setListing={setListing} refresh={getListings} />
        </div>
    )
}
