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

const getCurrentUserSettings = async (token, userId) => {
  const res = await fetch(config.url.API_URL + "/users/" + userId, {
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: token
    }
  });
  const user = await res.json(); 
  // return current user
  return user;
}

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      alert: false,
      alertTime: ''
    };
  }

  async componentDidMount() {
    // TODO: maybe put this in another function/file since we use it here and in App.js
    const token = (await asyncLocalStorage.getItem("token")) || "none";
    await this.setState({ token: token });
    // if token is none, then we do this to trigger redirect to login page
    if (this.state.token === "none") return;

    // get user's info from api
    const currentUser = await getCurrentUser(this.state.token);
    const userSettings = await getCurrentUserSettings(this.state.token, currentUser.id);
    await this.setState({
      firstName: userSettings.firstName,
      lastName: userSettings.lastName,
      email: userSettings.email,
      phone: userSettings.phone,
      alert: userSettings.alert,
      alertTime: userSettings.alertTime
    });
  }

  handleChangeComplete = async (color) => {
    // update background on page
    document.body.style.cssText = ('background:' + color.hex + ';');
    // update background color in local storage
    localStorage.setItem("backgroundColor", color.hex);
    // request current user's id from api using token
    const currentUser = await getCurrentUser(this.state.token);
    // update database
    await fetch(config.url.API_URL + "/users/" + currentUser.id, {
      method: "PATCH",
      body: JSON.stringify({ backgroundColor: color.hex }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: this.state.token
      }
    });
  };

  handleFormTextChange = async (event) => {

    let updateKey = event.target.name
    let updateValue = event.target.value

    this.setState({
      [updateKey]: updateValue
    });

    // verify user w/ api using token
    // TODO: just use the token on backend to determine user instead
    const currentUser = await getCurrentUser(this.state.token);

    // update database
    await fetch(config.url.API_URL + "/users/" + currentUser.id, {
      method: "PATCH",
      body: JSON.stringify({
        [updateKey]: updateValue
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: this.state.token
      }
    });
  };

  handleFormCheckboxChange = async (event) => {

    let updateKey = event.target.name
    let updateValue = event.target.checked

    this.setState({
      [updateKey]: updateValue
    });
    
    // verify user w/ api using token
    // TODO: just use the token on backend to determine user instead
    const currentUser = await getCurrentUser(this.state.token);

    // update database
    await fetch(config.url.API_URL + "/users/" + currentUser.id, {
      method: "PATCH",
      body: JSON.stringify({
        [updateKey]: updateValue
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: this.state.token
      }
    });

  };

  handleFormTimeChange = async (time) => {

    let updateKey = 'alertTime'
    let updateValue = time

    this.setState({
      [updateKey]: updateValue
    });

    // verify user w/ api using token
    // TODO: just use the token on backend to determine user instead
    const currentUser = await getCurrentUser(this.state.token);

    // update database
    await fetch(config.url.API_URL + "/users/" + currentUser.id, {
      method: "PATCH",
      body: JSON.stringify({
        [updateKey]: updateValue
      }),
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
          <br />
          <label>First name:</label>
          <input type="text" name="firstName" value={this.state.firstName} onChange={this.handleFormTextChange} />
          <label>Last name:</label>
          <input type="text" name="lastName" value={this.state.lastName} onChange={this.handleFormTextChange} />
          <label>Email:</label>
          <input type="text" name="email" value={this.state.email} onChange={this.handleFormTextChange} />
          <label>Phone:</label>
          <input type="text" name="phone" value={this.state.phone} onChange={this.handleFormTextChange} />
          <label>Alert:</label>
          <input type="checkbox" name="alert" checked={this.state.alert} onChange={this.handleFormCheckboxChange} />
          
          { this.state.alert ? (
            <span className="alertSettings">
              <label>Alert time:</label>
              <select name="alertTime" value={this.state.alertTime} onChange={this.handleFormTextChange}>
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
              <br />
              <br />
            </span>
          ) : '' }          
        </div>
      </div>
    );
  }
}

export default Settings;
