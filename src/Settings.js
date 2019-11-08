import React from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { CirclePicker } from "react-color";
import { config } from './config'
import { asyncLocalStorage } from './helpers'
import { Redirect } from "react-router-dom";


const getCurrentUser = async (token) => {
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
}

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  async componentDidMount() {
    // TODO: maybe put this in another function/file since we use it here and in App.js
    const token = (await asyncLocalStorage.getItem("token")) || "none";
    await this.setState({ token: token });
    // if token is none, then we do this to trigger redirect to login page
    if (this.state.token === "none") return;
  }

  handleChangeComplete = async (color) => {
    // update background on page
    document.body.style = ('background:' + color.hex + ';');
    // update background color in local storage
    localStorage.setItem("backgroundColor", color.hex);
    // request current user's id from api using token
    const currentUser = await getCurrentUser(this.state.token);
    //console.log(currentUser)
    // update backgroundColor in database
    await fetch(config.url.API_URL + "/users/" + currentUser.id, {
      method: "PATCH",
      body: JSON.stringify({ backgroundColor: color.hex }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: this.state.token
      }
    });
  };

  colors = [
    "#5900b3", "#FE7DC2", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3",
    "#010101", "#09A903", "#ff9800", "#393939", "#795548", "#607d8b"
  ]

  render() {
    // if no token, then redirect to login page
    if (this.state.token === "none") {
      return <Redirect to="/login" />;
    }

    return (
      <div className="App">
        <div className="App-wrapper">
          <Link to="/" className="nav">Go back</Link>
          <br />
          <CirclePicker
            color={ this.state.backgroundColor }
            onChangeComplete={ this.handleChangeComplete }
            colors={ this.colors }
          />
        </div>
      </div>
    );
  }
}

export default Settings;
