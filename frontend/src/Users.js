import React, { useContext, useState, useEffect } from "react";
import "./App.css";
import { Login } from "./Login.js";
import { Register } from "./Register.js";
import { AppContext } from "./AppContext.js";

import {
  useHistory,
  useLocation
} from 'react-router-dom'

import axios from "axios";

// React functional component
export function Users() {
  const [registerMode, setRegister] = useState(false);
  const [bannerMessage, setBanner] = useState("");

  const { baseURL, setUser, setJWT, JWT, user } = useContext(AppContext);

  const toggleRegisterMode = () => {
    setBanner("");
    setRegister(!registerMode);
  };

  let history = useHistory();
  let location = useLocation();
  const redirectToHome = () => {
    let { from } = location.state || { from: { pathname: "/" } };
    history.replace(from);
  }

  const doLogin = async (username, password) => {
    //Clear banner so they know its different
    setBanner("");

    axios
      .post(baseURL + "/login", { username, password })
      .then((res) => {
        //Handle success and update state
        setJWT(res.data.data.jwt)
        setUser(res.data.data)
        redirectToHome()
        localStorage.setItem("jwt", res.data.data.jwt)
      })
      .catch((e) => {
        setBanner(e.response.data.msg);
      });
  };

  const doRegister = (username, password, user_type) => {
    //Clear banner so they know its different
    setBanner("");

    axios
      .post(baseURL + "/users", { username, password, user_type })
      .then((res) => {
        setJWT(res.data.data.jwt)
        localStorage.setItem("jwt", res.data.data.jwt)
        setUser(res.data.data)
        redirectToHome()
      })
      .catch((e) => {
        setBanner(e.response.data.msg);
      });
  };

  let banner = <></>;
  if (bannerMessage !== "") {
    banner = (
      <div className="alert alert-primary" role="alert">
        {bannerMessage}
      </div>
    );
  }

  let form = (
    <Login
      banner={banner}
      doLogin={doLogin}
      toggleRegisterMode={toggleRegisterMode}
    />
  );
  if (registerMode) {
    form = (
      <Register
        banner={banner}
        doRegister={doRegister}
        toggleRegisterMode={toggleRegisterMode}
      />
    );
  }

  return (
    <div className="container h-100">
      <div className="h-100 row justify-content-center align-items-center">
        <form className="col-md-4">{form}</form>
      </div>
    </div>
  );
}
