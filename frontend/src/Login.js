import React, { useEffect, useState } from 'react';


export function Login(props) {
    return (
        <div>
            <div className="container h-100">
                <div style={{ "height": "100vh" }} className="row justify-content-center align-items-center">
                    <form className="col-4">
                        <div className="col-12 mb-3 text-center">
                            <h1>Login</h1>
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="username">Username</label>
                            <input type="text" className="form-control" id="username" placeholder="Enter username" />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="password">Password</label>
                            <input type="password" className="form-control" id="password" placeholder="Password" />
                            <small id="passwordHelp" className="form-text text-muted">Don't share your password with anybody.</small>
                        </div>
                        <div className="col-12 text-center">
                            <button type="submit" className="btn btn-primary mx-auto">Submit</button>
                        </div>
                        <div className="col-12 mt-3 text-center">
                            <p>Not a member? <a className="text-primary" onClick={() => props.setRegister(true)}>Register</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
