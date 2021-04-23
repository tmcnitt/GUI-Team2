import React, { useEffect } from "react";
import "./App.css";
import { Users } from "./Users.js";
import { ItemListingPage } from "./ItemListingPage";
import { UserDashboard } from './UserDashboard'
import { ListingPage } from './ListingPage'
import { TransactionPage } from './TransactionPage'

import { AppContext, useProvideAppContext, setupLogin } from "./AppContext.js";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { PrivateRoute } from './PrivateRoute.js'


// React functional component
export function App() {
  //Global app context
  let context = useProvideAppContext();

  useEffect(() => {
    setupLogin(context);
  }, [])

  if (!context.setup) {
    return <div></div>
  }

  return (
    <AppContext.Provider value={context}>
      <div className="container">

        <Router>
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
              <a className="navbar-brand" href="#">Navbar</a>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Link className="nav-link" to="/">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/listings">Listings</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/transactions">Transactions</Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <Switch>
            <Route path="/login">
              <Users />
            </Route>
            <PrivateRoute path="/listings">
              <ListingPage />
            </PrivateRoute>
            <PrivateRoute path="/transactions">
              <TransactionPage />
            </PrivateRoute>
            <PrivateRoute path="/" exact={true}>
              <UserDashboard />
            </PrivateRoute>

          </Switch>
        </Router>

      </div>
    </AppContext.Provider>
  );
}
