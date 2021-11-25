import React, { useContext, useEffect, useState } from "react";
import { config } from "../config";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { User } from "./User";

export const Users = () => {
  const navigate = useNavigate();
  const { ready, loggedIn, token } = useContext(UserContext);
  const [users, setUsers] = useState([]);

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
        setUsers(usersJson.users);
      } catch (err) {
        console.warn(err);
        navigate("/login");
      }
    })();
  }, [ready, loggedIn, token, navigate]);

  const removeUser = id => {
    setUsers(
      users.filter(u => {
        return u._id !== id;
      })
    );
  };

  return (
    <div className="App-wrapper">
      <ul className="list-group" style={{ width: "90%", maxWidth: 600 }}>
        {users.map(user => (
          <li key={user._id} className="list-group-item">
            <User user={user} onDelete={removeUser} />
          </li>
        ))}
      </ul>

      <br />

      <Link to={"/users/edit"}>
        <button type="button" className="btn btn-light" style={{width: 150}}>
          + Add user
        </button>
      </Link>
    </div>
  );
};
