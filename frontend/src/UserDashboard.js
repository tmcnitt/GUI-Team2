import React, { useState, useRef, useEffect, useContext, useLayoutEffect } from "react";
import { AppContext } from "./AppContext.js";
import axios from "axios";
import { axiosJWTHeader } from './utils'
import { AuctionList } from "./AuctionList.js";
import { TransactionList } from "./TransactionList"

export function UserDashboard() {
    const { user, baseURL, JWT } = useContext(AppContext);

    let [notifications, setNotifications] = useState([])

    useEffect(() => {
        axios.get(baseURL + '/notifications', {
            headers: axiosJWTHeader(JWT)
        }).then((r) => {
            setNotifications(r.data.data)
        })
    }, [])

    let notifItems = [];
    if (notifications && notifications.length) {
        notifications.forEach((notif) => {
            notifItems.push(
                <div class="alert alert-primary" role="alert" key={notif.id}>
                    {notif.text} at {new Date(notif.date).toLocaleString()}
                </div>
            )
        })
    }

    const read = () => {
        axios.put(baseURL + "/notifications", {}, {
            headers: axiosJWTHeader(JWT)
        }).then(() => {
            setNotifications([])
        })
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <h1>Hello, {user.username} </h1>
            </div>
            <div className="row mt-5">
                <h3>Notifications - <button className="btn btn-primary" onClick={() => read()}>Mark as read</button></h3>
                {notifItems}
            </div>
            <div className="row mt-5">
                <h3>Your Listings</h3>
                <AuctionList selling={true} />
            </div>
            <div className="row mt-5">
                <h3>Your Recent Transcations</h3>
                <TransactionList />
            </div>

        </div>
    )
}