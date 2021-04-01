import React, { useContext, useEffect, useState } from 'react';
import './App.css';
import { Login } from './Login.js'
import { Register } from './Register.js'
import { AppContext } from './AppContext.js';

import axios from 'axios';

// React functional component
export function Users() {
    const [registerMode, setRegister] = useState(false);
    const [bannerMessage, setBanner] = useState("");

    const { baseURL } = useContext(AppContext);

    const toggleRegisterMode = () => {
        setBanner("")
        setRegister(!registerMode)
    }

    const doLogin = async (username, password) => {
        //Clear banner so they know its different
        setBanner("")

        axios.post(baseURL + "/login", { username, password }).then((res) => {
            //TODO: Handle success, generate JWT on backend
        }).catch((e) => {
            setBanner(e.response.data.msg)
        });
    }

    const doRegister = (username, password, user_type) => {
        //Clear banner so they know its different
        setBanner("")

        axios.post(baseURL + "/users", { username, password,user_type }).then((res) => {
            //TODO: Handle success, generate JWT on backend
            setBanner("Success!")
        }).catch((e) => {
            setBanner(e.response.data.msg)
        });
    }

    let banner = <></>
    if (bannerMessage != "") {
        banner = (
            <div className="alert alert-primary" role="alert">
                {bannerMessage}
            </div>
        )
    }

    let form = <Login banner={banner} doLogin={doLogin} toggleRegisterMode={toggleRegisterMode} />
    if (registerMode) {
        form = <Register banner={banner} doRegister={doRegister} toggleRegisterMode={toggleRegisterMode} />
    }

    return (
        <div className="container h-100">
            <div className="h-100 row justify-content-center align-items-center">
                <form className="col-4">
                    {form}
                </form>
            </div>
        </div>)

}