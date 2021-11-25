import React, { useContext, useEffect, useState } from "react";
import "../App.css";
import { CirclePicker } from "react-color";
import { config } from "../config";
import { Loading } from "./Loading";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const colors = [
  "#5900b3",
  "#FE7DC2",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#010101",
  "#09A903",
  "#ff9800",
  "#393939",
  "#795548",
  "#607d8b"
];

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState(0);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    alert: false,
    alertTime: "",
    backgroundColor: colors[0]
  });
  const { ready, loggedIn, token } = useContext(UserContext);
  const navigate = useNavigate();

  const handleColorChange = async color => {
    setUser({ ...user, backgroundColor: color.hex });
    // update background on page
    document.body.style.cssText = "background:" + color.hex + ";";
    // update background color in local storage
    localStorage.setItem("backgroundColor", color.hex);
    // update database
    await fetch(config.url.API_URL + "/users/" + userID, {
      method: "PATCH",
      body: JSON.stringify({ backgroundColor: color.hex }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: token
      }
    });
  };

  const handleFormChange = async event => {
    let updateKey = event.target.name;
    let updateValue =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setUser({ ...user, [updateKey]: updateValue });

    // update database
    await fetch(config.url.API_URL + "/users/" + userID, {
      method: "PATCH",
      body: JSON.stringify({
        [updateKey]: updateValue
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: token
      }
    });
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      // get users from api
      const res = await fetch(config.url.API_URL + "/users", {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: token
        }
      });
      const users = await res.json();
      // return current user
      return users.currentUser;
    };

    const getCurrentUserSettings = async userId => {
      const res = await fetch(config.url.API_URL + "/users/" + userId, {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: token
        }
      });
      return await res.json();
    };

    (async () => {
      if (!ready) return;
      const currentUser = await getCurrentUser();
      try {
        setUserID(currentUser.id);
        const userSettings = await getCurrentUserSettings(currentUser.id);
        setUser(userSettings);
        setLoading(false);
      } catch (e) {
        console.warn(e);
        navigate("/login");
      }
    })();
  }, [loggedIn, ready, navigate, token]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="App-wrapper">
      <CirclePicker
        color={user.backgroundColor}
        onChangeComplete={handleColorChange}
        colors={colors}
      />
      <br />

      <div className="form-group settings-form-field">
        <label>First name:</label>
        <input
          type="text"
          name="firstName"
          value={user.firstName}
          onChange={handleFormChange}
          autoComplete="off"
          className={"form-control"}
        />
      </div>

      <div className="form-group settings-form-field">
        <label>Last name:</label>
        <input
          type="text"
          name="lastName"
          value={user.lastName}
          onChange={handleFormChange}
          autoComplete="off"
          className={"form-control"}
        />
      </div>

      <div className="form-group settings-form-field">
        <label>Email:</label>
        <input
          type="text"
          name="email"
          value={user.email}
          onChange={handleFormChange}
          autoComplete="off"
          className={"form-control"}
        />
      </div>

      <div className="form-group settings-form-field">
        <label>Phone:</label>
        <input
          type="text"
          name="phone"
          value={user.phone}
          onChange={handleFormChange}
          autoComplete="off"
          className={"form-control"}
        />
      </div>

      <div className="form-check settings-form-field">
        <input
          type="checkbox"
          name="alert"
          checked={user.alert}
          onChange={handleFormChange}
          autoComplete="off"
          className={"form-check-input"}
        />
        <label className="form-check-label">Enable SMS alert</label>
      </div>

      {user.alert && (
        <div className="form-group settings-form-field">
          <label htmlFor={"alertTime"}>Alert time:</label>
          <select
            name="alertTime"
            value={user.alertTime}
            onChange={handleFormChange}
            autoComplete="off"
            className={"form-control"}
          >
            <option value="17:00">5:00 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="20:00">8:00 PM</option>
            <option value="21:00">9:00 PM</option>
            <option value="21:15">9:15 PM</option>
            <option value="21:30">9:30 PM</option>
            <option value="21:45">9:45 PM</option>
            <option value="22:00">10:00 PM</option>
            <option value="22:15">10:15 PM</option>
            <option value="22:30">10:30 PM</option>
            <option value="22:45">10:45 PM</option>
            <option value="23:00">11:00 PM</option>
            <option value="23:15">11:15 PM</option>
            <option value="23:30">11:30 PM</option>
            <option value="23:45">11:45 PM</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default Settings;
