import React, { useEffect } from "react";
import "./App.css";
import { Users } from "./Users.js";

import { AuctionList } from "./AuctionList";
import { ItemListingPage } from './ItemListingPage'
import { UserDashboard } from './UserDashboard'
import { ListingPage } from './ListingPage'

import axios from "axios";

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
      <div className="App">
        <header className="App-header"></header>

        <Router>
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
            <PrivateRoute path="/">
              <UserDashboard />
            </PrivateRoute>

          </Switch>
        </Router>

      </div>
    </AppContext.Provider>
  );
}
