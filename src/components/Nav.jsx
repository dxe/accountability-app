import { Link, useLocation } from "react-router-dom";
import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";

export const Nav = () => {
  const { loggedIn } = useContext(UserContext);
  const location = useLocation();

  return (
    <nav className="navbar fixed-top navbar-expand-lg navbar-light">
      <div className="container-fluid">
        <div className="navbar-brand">Accountability</div>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {loggedIn && (
              <li className="nav-item">
                <Link to="/" className={location.pathname === "/" ? "nav-link active" : "nav-link"}>
                  Home
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link to="/dashboard" className={location.pathname === "/dashboard" ? "nav-link active" : "nav-link"}>
                Dashboard
              </Link>
            </li>
            {loggedIn && (
              <li className="nav-item">
                <Link to="/settings" className={location.pathname === "/settings" ? "nav-link active" : "nav-link"}>
                  Settings
                </Link>
              </li>
            )}
            {loggedIn && (
              <li className="nav-item">
                <Link to="/users" className={location.pathname === "/users" ? "nav-link active" : "nav-link"}>
                  Users
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {/*TODO: get this to the right*/}
            <li className="nav-item">
              <Link to="/login" className={"nav-link"}>
                {loggedIn ? "Log out" : "Log in"}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
