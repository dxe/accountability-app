import React from "react";

export const UserContext = React.createContext({
  ready: false,
  setReady: () => {},
  loggedIn: false,
  setLoggedIn: () => {},
  token: "",
  setToken: () => {}
});
