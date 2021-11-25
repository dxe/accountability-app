import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { config } from "../config";
import { UserContext } from "../context/UserContext";

export const EditUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    email: ""
  });
  const { token } = useContext(UserContext);

  useEffect(() => {
    if (location?.state?.user) {
      setUser(location.state.user);
    }
  }, [location.state]);

  const validateFields = () => {
    // TODO: use "every" to validate
    if (user.firstName.length === 0) {
      return "First name must not be blank!";
    }
    if (user.lastName.length === 0) {
      return "Last name must not be blank!";
    }
    if (user.email.length === 0) {
      return "Email must not be blank!";
    }
    return "";
  };

  const handleFormChange = event => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  const handleFormSubmit = async event => {
    event.preventDefault();

    setSaving(true);
    const err = validateFields();
    if (err !== "") {
      alert(err);
      setSaving(false);
      return;
    }

    try {
      await fetch(config.url.API_URL + "/users/" + user._id, {
        method: user._id === "" ? "POST" : "PATCH", // TODO: test
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: token
        }
      });
      navigate("/users");
    } catch(e) {
      alert("Failed to update user!")
    }

  };

  return (
    <div className="App-wrapper">
      <h2>{user._id === "" ? "New" : "Edit"} user</h2>

      <form className="settings-form-field" onSubmit={handleFormSubmit}>
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

        <br />

        <button type="submit" className="btn btn-light" disabled={saving}>
          Save
        </button>
      </form>
    </div>
  );
};
