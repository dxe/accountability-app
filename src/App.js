import React from "react";
import { Link, Redirect } from "react-router-dom";
import { Offline } from "react-detect-offline";
import TextareaAutosize from "react-autosize-textarea";
import moment from "moment";
import { config } from './config'
import { asyncLocalStorage } from './helpers'

import "./App.css";

const Accomplishment = props => (
  <div className="accomplishment">
    {props.selectedUser === props.loggedInUser.id &&
    moment.utc(props.data.date).format("YYYY-MM-DD") ===
      moment(new Date()).format("YYYY-MM-DD")
      ? `What did you do today, ${moment
          .utc(props.data.date)
          .format("dddd, MMMM Do")}?`
      : moment.utc(props.data.date).format("dddd, MMMM D")}
    <br />
    <TextareaAutosize
      className="accomplishment-text"
      value={props.data.text}
      onChange={props.onChange}
    />
    <br />
    <br />
  </div>
);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      users: [],
      selectedUser: "",
      loggedInUser: {},
      currentHour: moment(new Date()).format('HH'),
      today: moment(new Date()).format("YYYY-MM-DD"),
      twoWeeksAgo: moment(new Date())
        .add(-14, "days")
        .format("YYYY-MM-DD"),
      yesterday: moment(new Date())
        .add(-1, "days")
        .format("YYYY-MM-DD")
    };
  }

  async handleChange(id, date, event) {
    // if loggedInUser is not the selected user, then don't allow any changes
    if (this.state.loggedInUser.id !== this.state.selectedUser)
      return alert(
        "Sorry, you may not edit accomplishments belonging to other users."
      );

    // if date is before yesterday, then don't allow any changes
    if (moment.utc(date).format("YYYY-MM-DD") < this.state.yesterday)
      return alert(
        "Sorry, you may not edit your accomplishments from dates prior to yesterday."
      );

    // copy the state to a new variable to modify
    let newData = [...this.state.data];
    let reqBody;

    if (!id) {
      // no id provided from database, so we need to find the object in the state using its date
      let objIndex = newData.findIndex(obj => obj.date === date);
      newData[objIndex].text = event.target.value;
      // prepare api request body
      reqBody = JSON.stringify({
        id: null,
        text: event.target.value,
        user: this.state.selectedUser,
        date: date
      });
    } else {
      // find index in the array
      let objIndex = newData.findIndex(obj => obj._id === id);
      newData[objIndex].text = event.target.value;
      // prepare api request body
      reqBody = JSON.stringify({
        id: id,
        text: event.target.value
      });
    }

    // send api requests

    fetch(config.url.API_URL + "/accomplishments/", {
      method: "PUT",
      body: reqBody,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: this.state.token
      }
    })
      .then(response => {
        return response.json();
      })
      .then(json => {
        // IF !id, then update object in state to have the newly created id
        if (!id) {
          // get index based on date
          let objIndex = newData.findIndex(
            obj => obj.date === moment.utc(json.date).format("YYYY-MM-DD")
          );
          // set the new id in the data for the state
          newData[objIndex]._id = json._id;
        }
      }).catch(err => {
        console.log("Error saving data!");
        alert("Sorry, there was an error saving your data! Please contact support.");
      });

    // update the state
    await this.setState({ data: newData });

    // if it's a new day, we need to update the state
    const actualCurrentDate = moment(new Date()).format("YYYY-MM-DD");
    if (actualCurrentDate > this.state.today) {
      console.log("It's a new day! Updating 'today' in state.");
      await this.setState({
        today: actualCurrentDate,
        twoWeeksAgo: moment(new Date())
          .add(-14, "days")
          .format("YYYY-MM-DD"),
        yesterday: moment(new Date())
          .add(-1, "days")
          .format("YYYY-MM-DD")
      });
      // lazy way to reconstruct the page using new dates
      this.componentDidMount();
    }
  }

  async handleUserChange(id) {
    // don't set loading to true b/c it makes the page look too jumpy

    console.log(`Selected user changed: ${id}`);

    // update the state with the new selectedUser
    await this.setState({ selectedUser: id });

    // get the selected user's accomplishment data
    try {
      const dataJson = await this.getAccomplishments();
      await this.setState({ data: dataJson });
    } catch (err) {
      alert(`Failed to get data for selected user: ${err}`);
    }
  }

  async getUsers() {
    const res = await fetch(config.url.API_URL + "/users", {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: this.state.token
      }
    });
    return res.json();
  }

  async getAccomplishments() {
    const res = await fetch(
      config.url.API_URL + `/accomplishments/?start_date=${this.state.twoWeeksAgo}&end_date=${this.state.today}&user=${this.state.selectedUser}`,
      {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: this.state.token
        }
      }
    );
    return res.json();
  }

  async componentDidMount() {
    const token = (await asyncLocalStorage.getItem("token")) || "none";
    // if token = none in state, then they will be send back to login page
    await this.setState({ loading: true, token: token });
    if (this.state.token === "none") return;

    try {
      const usersJson = await this.getUsers();

      this.setState({
        users: usersJson.users,
        selectedUser: usersJson.currentUser.id,
        loggedInUser: usersJson.currentUser
      });

      const dataJson = await this.getAccomplishments();

      this.setState({
        data: dataJson,
        selectedUser: usersJson.currentUser.id,
        loggedInUser: usersJson.currentUser,
        loading: false
      });

    } catch (err) {
      // if we get an error, then token is probably invalid, so just redirect to login page
      alert("Error getting data. Please login again. If the error persists, please contact support.");
      this.setState({ token: "none" });
    }
  }

  render() {
    if (this.state.token === "none") {
      return <Redirect to="/login" />;
    }

    if (this.state.loading) {
      return (
        <div className="App">
          <div className="App-wrapper"></div>
        </div>
      );
    }

    const greeting =
      this.state.selectedUser === this.state.loggedInUser.id ? (
        <p>
          {
            this.state.currentHour >= 5 && this.state.currentHour <= 11 ? ("Good morning")
            : this.state.currentHour >= 12 && this.state.currentHour <= 16 ? ("Good afternoon")
            : this.state.currentHour >= 17 && this.state.currentHour <= 23 ? ("Good evening")
            : "Hello"
          }
          , {this.state.loggedInUser.firstName}.
        </p>
      ) : (
        <p></p>
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
              defaultValue={this.state.selectedUser}
              onChange={event => {
                this.handleUserChange(event.target.value);
              }}
            >
              {this.state.users.map(user => (
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

            {this.state.data.map(data => (
              <Accomplishment
                key={data.date + this.state.selectedUser}
                data={data}
                selectedUser={this.state.selectedUser}
                loggedInUser={this.state.loggedInUser}
                onChange={event => {
                  this.handleChange(data._id, data.date, event);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
