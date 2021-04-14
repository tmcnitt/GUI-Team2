import React from 'react';
import { Product } from './models/Product';

export class Fixed extends React.Component {

    constructor() {
        super();
    }

    state = {
        discount: ''  
    }


    render() {
        return <>
        <h3>You saved: {this.state.discount}</h3>
        
        </>;
    }
}