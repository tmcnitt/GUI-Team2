import React, { useEffect } from "react";
import "./App.css";
import { Users } from "./Users.js";
import { ItemListingPage } from "./ItemListingPage";
import { UserDashboard } from './UserDashboard'
import { ListingPage } from './ListingPage'

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
          <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
              <a class="navbar-brand" href="#">Navbar</a>
              <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                  <li class="nav-item">
                    <Link className="nav-link" to="/">Dashboard</Link>
                  </li>
                  <li class="nav-item">
                    <Link className="nav-link" to="/listings">Listings</Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <Switch>
            <Route path="/login">
              <Users />
            </Route>
            <Route path="/listings">
              <ListingPage />
            </Route>
            <Route path="/listing">
              <ItemListingPage />
            </Route>
            <PrivateRoute path="/" exact={true}>
              <UserDashboard />
            </PrivateRoute>

          </Switch>
        </Router>

      </div>
    </AppContext.Provider>
  );
}
