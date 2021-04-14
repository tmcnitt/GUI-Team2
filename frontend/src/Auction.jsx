import React from 'react';
import { Listing } from './models/Listing';

export class Auction extends React.Component {

    constructor(props) {
        super(props);
    }


    render() {
        return <>
        <h3>Current Price: {this.props.current_bid}</h3>
        <p className="lead">Time Remaining: {this.props.end_time}</p>
        
        </>;
    }
}