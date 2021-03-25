import React, { useEffect, useState } from 'react';
import './App.css';
import {Login} from './Login.js'
import {Register} from './Register.js'

import axios from 'axios';

// React functional component
export function Users() {

    const [registerMode, setRegister] = useState(false);

    if (registerMode) {
        return ( <Register setRegister={setRegister} />  )
    } else {
        return <Login setRegister={setRegister} />
    }

}