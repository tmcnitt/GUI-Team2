import React, { useEffect } from "react";
import "./App.css";
import { Users } from "./Users.js";
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
    return <div><p>App Loading</p></div>
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
            <PrivateRoute path="/">
              <p>User dashboard!</p>
            </PrivateRoute>
          </Switch>
        </Router>
      </div>
    </AppContext.Provider>
  );
}
