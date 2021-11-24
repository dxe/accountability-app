import React, { useCallback, useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { Offline } from "react-detect-offline";
import moment from "moment";
import { config } from "./config";
import { asyncLocalStorage } from "./helpers";
import "./App.css";
import { Loading } from "./components/Loading";
import { Accomplishment } from "./components/Accomplishment";

const App = () => {
  const [loading, setLoading] = useState(true);
  // TODO: pass token to child components from App using context instead of constantly reading from local storage
  const [token, setToken] = useState("none");
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  // TODO: pass loggedInUser via context to Accomplishments as well
  const [loggedInUser, setLoggedInUser] = useState({});
  const [loggedInUserFirstName, setLoggedInUserFirstName] = useState("");

  // TODO: update these variables every 5 min w/ a useEffect?
  const currentHour = moment(new Date()).format("HH");
  const today = moment(new Date()).format("YYYY-MM-DD");
  const twoWeeksAgo = moment(new Date())
    .add(-14, "days")
    .format("YYYY-MM-DD");

  const handleUserChange = async id => {
    console.log(`Selected user changed: ${id}`);
    setSelectedUser(id);
  };

  const getAccomplishments = useCallback(async () => {
    if (selectedUser === "") return;

    console.log(`getting accomplishments for user ${selectedUser}`);
    const res = await fetch(
      config.url.API_URL +
        `/accomplishments/?start_date=${twoWeeksAgo}&end_date=${today}&user=${selectedUser}`,
      {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: token
        }
      }
    );
    return await res.json();
  }, [selectedUser, today, token, twoWeeksAgo]);

  // When component initially loads, set the token in state.
  useEffect(() => {
    (async () => {
      setToken(await asyncLocalStorage.getItem("token"));
    })();
  });

  // Once token is set, get users & current user from API & update the state.
  useEffect(() => {
    const getUsers = async () => {
      const res = await fetch(config.url.API_URL + "/users", {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: token
        }
      });
      return res.json();
    };

    (async () => {
      if (token === "none") return;

      try {
        const usersJson = await getUsers();

        let loggedInUserFirstName = usersJson.users.find(obj => {
          return obj._id === usersJson.currentUser.id;
        }).firstName;

        setUsers(usersJson.users);
        setSelectedUser(usersJson.currentUser.id);
        setLoggedInUser(usersJson.currentUser);
        setLoggedInUserFirstName(loggedInUserFirstName);
      } catch (err) {
        // if we get an error, then token is probably invalid, so just redirect to login page
        alert("Please login again.");
        setToken("invalid");
      }
    })();
  }, [token]);

  // When selected user is changed, get accomplishments for that user.
  useEffect(() => {
    (async () => {
      const dataJson = await getAccomplishments();
      setData(dataJson);
      setLoading(false);
    })();
  }, [selectedUser, getAccomplishments]);

  if (token === "invalid") {
    console.log("token is invalid");
    return <Redirect to="/login" />;
  }

  if (loading) {
    return <Loading />;
  }

  const greeting =
    selectedUser === loggedInUser.id ? (
      <p>
        {currentHour >= 5 && currentHour <= 11
          ? "Good morning"
          : currentHour >= 12 && currentHour <= 16
          ? "Good afternoon"
          : currentHour >= 17 && currentHour <= 23
          ? "Good evening"
          : "Hello"}
        , {loggedInUserFirstName}.
      </p>
    ) : (
      <br />
    );

  return (
    <div className="App">
      <div className="App-wrapper">
        <div className="accomplishments-wrapper">
          <Offline>
            <h1>
              You are offline!
              <br />
              Data will not be saved!
            </h1>
          </Offline>

          <select
            className="select-css"
            value={selectedUser}
            onChange={event => {
              handleUserChange(event.target.value);
            }}
          >
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.firstName + " " + user.lastName}
              </option>
            ))}
          </select>

          <div className="nav">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/login">Logout</Link>
          </div>

          {greeting}

          {data &&
            data.map(a => {
              return (
                <Accomplishment
                  key={selectedUser + a.date}
                  initialData={a}
                  selectedUser={selectedUser}
                  loggedInUser={loggedInUser}
                  token={token}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default App;
