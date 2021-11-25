import { Offline } from "react-detect-offline";
import { Accomplishment } from "./Accomplishment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import moment from "moment";
import { config } from "../config";
import { useNavigate } from "react-router-dom";
import { Loading } from "./Loading";
import { UserContext } from "../context/UserContext";

export const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  // TODO: pass loggedInUser via context to Accomplishments?
  const [loggedInUser, setLoggedInUser] = useState({});
  const [loggedInUserFirstName, setLoggedInUserFirstName] = useState("");
  const { ready, loggedIn, token } = useContext(UserContext);

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
  }, [selectedUser, today, twoWeeksAgo, token]);

  // On initial component load
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
      if (!ready) return;
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
        console.warn(err);
        navigate("/login");
      }
    })();
  }, [ready, loggedIn, navigate, token]);

  // When selected user is changed, get accomplishments for that user.
  useEffect(() => {
    (async () => {
      const dataJson = await getAccomplishments();
      setData(dataJson);
      setLoading(false);
    })();
  }, [selectedUser, getAccomplishments]);

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
          style={{ marginBottom: 10 }}
        >
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.firstName + " " + user.lastName}
            </option>
          ))}
        </select>

        {greeting}

        {data &&
          data.map(a => {
            return (
              <Accomplishment
                key={selectedUser + a.date}
                initialData={a}
                selectedUser={selectedUser}
                loggedInUser={loggedInUser}
              />
            );
          })}
      </div>
    </div>
  );
};
