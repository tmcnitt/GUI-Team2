import React, { useState, useEffect, useRef, useContext } from 'react'
import { AppContext } from "./AppContext.js";
import axios from "axios"
import { capitalize } from './utils'
import { axiosJWTHeader } from './utils'
import { CreateReviewModal } from './CreateReviewModal'

function Transaction({ transaction, review }) {
    let client = transaction.purchaser_username;

    if (transaction.is_purchaser) {
        client = transaction.lister_username
    }

    //seller leaves a review (seller reviews buyer)
    let review_of_buyer = (transaction.lister_reviews_stars || '-') + "/5"

    //purchaser leaves a reviews (buyer reviews seller)
    let review_of_seller = (transaction.purchaser_reviews_stars || '-') + "/5"


    if (transaction.is_purchaser) {
        if (!transaction.purchaser_reviews_stars) {
            review_of_seller = (
                <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#reviewModal" onClick={() => review(transaction.list_user_id)}>Leave Review</button>
            )
        } else {

        }

    }
    if (!transaction.is_purchaser && !transaction.lister_reviews_stars) {
        review_of_buyer = (
            <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#reviewModal" onClick={() => review(transaction.purchase_user_id)}>Leave Review</button>
        )
    }

    let were_seller = "Yes"
    if (transaction.is_purchaser == 1) {
        were_seller = "No"
    }

    return (
        <tr className="itemRow">
            <td>{new Date(transaction.date).toLocaleDateString()}</td>
            <td>{capitalize(transaction.product_name)}</td>
            <td>{transaction.listing_type}</td>
            <td>${transaction.price}</td>
            <td>{transaction.quantity}</td>
            <td>{client}</td>
            <td>{were_seller}</td>
            <td>{review_of_buyer}</td>
            <td>{review_of_seller}</td>
        </tr >
    )
}



export function TransactionList({ transactions }) {
    const { baseURL, JWT } = useContext(AppContext);
    let [trans, setTrans] = useState([])
    let [dTable, setdTable] = useState(null)
    const table = useRef();

    const getTrans = () => {
        axios.get(baseURL + '/transactions', {
            headers: axiosJWTHeader(JWT)
        }).then((r) => {
            setTrans(r.data.data)
            setdTable(window.$(table.current).DataTable({ destroy: true, responsive: true }))
        })
    }

    useEffect(() => {
        getTrans()

        window.$.fn.dataTable.ext.search.push(
            function (settings, data, dataIndex) {
                if (settings.nTable.id != "transactions") {
                    return true;
                }

                var min = window.$('#min').val();
                var max = window.$('#max').val();
                var date = data[0];

                if (!min || !max) {
                    return true
                }

                min = new Date(min)
                max = new Date(max)
                date = new Date(date)

                if (date < min) {
                    return false
                }
                if (date > max) {
                    return false
                }
                return true
            }
        );
    }, [])

    let [reviewee, setReviewee] = useState("")

    const review = (values) => {
        let data = Object.assign({}, values, { reviewee })
        axios.post(baseURL + "/reviews/", data, { headers: axiosJWTHeader(JWT) }).then(r => {
            getTrans()
        })
    }

    let items = []
    if (trans && trans.length) {

        trans.forEach((tran) => {
            items.push(
                <Transaction key={tran.id} transaction={tran} review={setReviewee} />
            )
        })

    }

    return (
        <>
            <div className="col-12 col-lg-6">
                <form className="row g-3">
                    <div className="col-md-5">
                        <label htmlFor="min" className="form-label">Start Date</label>
                        <input type="date" className="form-control" id="min" />
                    </div>
                    <div className="col-md-5">
                        <label htmlFor="max" className="form-label">End Date</label>
                        <input type="date" className="form-control" id="max" />
                    </div>
                    <div className="col-md-2">
                        <label htmlFor="end" className="form-label text-white">_</label>
                        <button type="button" className="form-control btn btn-primary" onClick={() => dTable.draw()}>Filter</button>
                    </div>
                </form>
            </div>

            <CreateReviewModal createReview={review} />
            <div className="p-2">
                <table className="table table-striped" ref={table} id="transactions">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Item Name</th>
                            <th scope="col">Listing Type</th>
                            <th scope="col">Price</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Username</th>
                            <th scope="col">Were seller?</th>
                            <th scope="col">Review of Purchaser</th>
                            <th scope="col">Review of Seller</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                    </tbody>
                </table>
            </div>
        </>
    )
}