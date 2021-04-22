import React, { useState, useEffect, useContext } from "react";
import { TransactionList } from "./TransactionList"

export function TransactionPage() {
    return (
        <div className="container mt-5">
            <h3>Your Recent Transcations</h3>
            <TransactionList />
        </div>
    )
}