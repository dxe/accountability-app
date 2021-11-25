import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Nav } from "./components/Nav";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Settings from "./components/Settings";
import NotFound from "./components/NotFound";
import { Home } from "./components/Home";
import { asyncLocalStorage } from "./helpers";
import { UserContext } from "./context/UserContext";
import { Users } from "./components/Users";
import { EditUser } from "./components/EditUser";

const App = () => {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      const tokenFromStorage = await asyncLocalStorage.getItem("token");
      if (tokenFromStorage) {
        setLoggedIn(true);
        setToken(tokenFromStorage);
      }
      setReady(true);
    })();
  }, []);

  return (
    <div className="App" style={{ marginTop: 70 }}>
      <UserContext.Provider
        value={{
          ready: ready,
          loggedIn: loggedIn,
          setLoggedIn: setLoggedIn,
          token: token,
          setToken: setToken
        }}
      >
        {/*TODO: hide nav if not logged in – except maybe login & dashboard? */}
        <Nav />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/edit" element={<EditUser />} />
          <Route element={<NotFound />} />
        </Routes>
      </UserContext.Provider>
    </div>
  );
};

export default App;
