import React, { useState, useEffect, useRef, useContext } from 'react'
import { AppContext } from "./AppContext.js";
import axios from "axios"
import { capitalize, relativeTime } from './utils'
import { axiosJWTHeader } from './utils'

function Transaction({ transaction }) {
    let client = transaction.purchaser_username;

    if (transaction.is_purchaser) {
        client = transaction.lister_username
    }

    let seller_review = transaction.purchaser_reviews_stars || '-'
    let buyer_review = transaction.lister_reviews_stars || '-'

    if (transaction.is_purchaser && buyer_review == "-") {
        buyer_review = (
            <button className="btn btn-primary">Leave Review</button>
        )
    }
    if (!transaction.is_purchaser && seller_review == "-") {
        seller_review = (
            <button className="btn btn-primary">Leave Review</button>
        )
    }

    let were_seller = "Yes"
    if (transaction.is_purchaser == 1) {
        were_seller = "No"
    }

    return (
        <tr className="itemRow">
            <th scope="row">{capitalize(transaction.product_name)}</th>
            <td>{transaction.listing_type}</td>
            <td>${transaction.price}</td>
            <td>{transaction.quantity}</td>
            <td>{client}</td>
            <td>{were_seller}</td>
            <td>{seller_review}</td>
            <td>{buyer_review}</td>
        </tr>
    )
}

export function TransactionList({ transactions }) {
    const { baseURL, JWT } = useContext(AppContext);
    let [trans, setTrans] = useState([])
    const table = useRef();

    useEffect(() => {
        axios.get(baseURL + '/transactions', {
            headers: axiosJWTHeader(JWT)
        }).then((r) => {
            setTrans(r.data.data)
        })
    }, [])

    let items = []
    if (trans && trans.length) {

        trans.forEach((tran) => {
            items.push(
                <Transaction key={tran.id} transaction={tran} />
            )
            console.log(tran)
        })

    }

    return (
        <div className="p-2 mt-5">
            <table className="table table-striped" ref={table}>
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">Item Name</th>
                        <th scope="col">Listing Type</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Username</th>
                        <th scope="col">Were seller?</th>
                        <th scope="col">Seller Review</th>
                        <th scope="col">Purchaser Review</th>
                    </tr>
                </thead>
                <tbody>
                    {items}
                </tbody>
            </table>
        </div>
    )
}