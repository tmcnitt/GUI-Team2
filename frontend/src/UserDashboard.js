import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContext.js";
import axios from "axios";
import { axiosJWTHeader } from './utils'
import { AuctionList } from "./AuctionList.js";
import { TransactionList } from "./TransactionList"
import { ListingPage } from "./ListingPage.js";

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
    let notif = null;
    if (notifications && notifications.length) {
        notifications.forEach((notif) => {
            notifItems.push(
                <div className="alert alert-primary" role="alert" key={notif.id}>
                    {notif.text} at {new Date(notif.date).toLocaleString()}
                </div>
            )
        })

        notif = (
            <div className="row mt-5">
                <h3>Notifications - <button className="btn btn-primary" onClick={() => read()}>Mark as read</button></h3>
                {notifItems}
            </div>

        )
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
            {notif}
            <div className="row mt-5">
                <ListingPage selling={true} />
            </div>
        </div>
    )
}