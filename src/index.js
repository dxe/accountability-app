import * as Sentry from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

Sentry.init({
  dsn: "https://0b9bf436351f4d808715372f23bd757f@sentry.io/1817580"
});

// set background color from local storage
const color = localStorage.getItem("backgroundColor") || "#5900b3";
document.body.style.cssText = "background:" + color + ";";

const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

ReactDOM.render(app, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
