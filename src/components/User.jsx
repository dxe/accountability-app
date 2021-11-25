import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { config } from "../config";
import { UserContext } from "../context/UserContext";

export const User = ({ user, onDelete }) => {
  const { token } = useContext(UserContext);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    try {
      await fetch(config.url.API_URL + "/users/" + user._id, {
        method: "DELETE",
        headers: {
          Authorization: token
        }
      });
      onDelete(user._id);
    } catch(e) {
      alert("Failed to delete user!")
    }

  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          {user.firstName} {user.lastName}
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ padding: 3 }}>
            <Link to={"/users/edit"} state={{ user: user }}>
              <button type="button" className="btn btn-success">
                Edit
              </button>
            </Link>
          </div>
          <div style={{ padding: 3 }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

User.propTypes = {
  user: PropTypes.object,
  onDelete: PropTypes.func
};
