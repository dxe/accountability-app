import * as Sentry from '@sentry/browser';
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import Dashboard from "./Dashboard";
import Login from "./Login";
import Settings from "./Settings";
import NotFound from "./NotFound";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

Sentry.init({dsn: "https://0b9bf436351f4d808715372f23bd757f@sentry.io/1817580"});

// set background color from local storage
const color = (localStorage.getItem("backgroundColor")) || "#5900b3";
document.body.style = ('background:' + color + ';');

const routing = (
  <Router>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

ReactDOM.render(routing, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
