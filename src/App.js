import React from "react";
import { Link, Redirect } from "react-router-dom";
import { Offline } from "react-detect-offline";
import TextareaAutosize from "react-autosize-textarea";
import moment from "moment";
import { config } from './config'

import "./App.css";

const asyncLocalStorage = {
  getItem: function(key) {
    return Promise.resolve().then(function() {
      return localStorage.getItem(key);
    });
  }
};

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
      });

    // update the state
    await this.setState({ data: newData });
    //console.log(this.state);

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
      //console.log(this.state);
      // lazy way to reconstruct the page using new dates
      this.componentDidMount();
    }
  }

  async handleUserChange(id) {
    await this.setState({ loading: true });

    console.log(`Selected user changed: ${id}`);

    // update the state with the new selectedUser
    await this.setState({ selectedUser: id });
    //console.log(this.state);

    // get the selected user's accomplishment data
    try {
      const dataJson = await this.getAccomplishments();
      await this.setState({ data: dataJson, loading: false });
      //console.log(this.state);
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
    // TODO: verify token is valid with server before making other calls to get data,
    // then if not valid or expired, send to login page

    const token =
      (await asyncLocalStorage.getItem("dxeAccountability")) || "none";

    await this.setState({ loading: true, token: token });
    //console.log(this.state);
    if (this.state.token === "none") return;

    try {
      // we have to get users BEFORE the other data (not at same time)
      // otherwise, we won't know who the selected user is.
      // maybe we can go back to getting all of the data at once like this
      // after we are doing a separate 1st call to validate user?
      //
      // Promise.all([this.getUsers(), this.getAccomplishments()])
      // .then(([usersJson, dataJson]) => {
      //   this.setState({ , , , data: dataJson, loading: false })
      //   console.log(this.state)
      // })
      // .catch(err => {
      //   // if we get an error, then token is probably invalid, so redirect to login page
      //   alert("Please login again.")
      //   //alert(`Failed to get users or data: ${err}`)
      //   this.setState({ token: "none" })
      //   console.log(this.state)
      // });

      const usersJson = await this.getUsers();

      this.setState({
        users: usersJson.users,
        selectedUser: usersJson.currentUser.id,
        loggedInUser: usersJson.currentUser
      });

      //console.log(this.state);

      const dataJson = await this.getAccomplishments();

      this.setState({
        data: dataJson,
        selectedUser: usersJson.currentUser.id,
        loggedInUser: usersJson.currentUser,
        loading: false
      });

      //console.log(this.state);
    } catch (err) {
      // if we get an error, then token is probably invalid, so just redirect to login page
      alert("Please login again.");
      //alert(`Failed to get users or data: ${err}`)
      this.setState({ token: "none" });
      //console.log(this.state);
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
        <p>Hello, {this.state.loggedInUser.firstName}.</p>
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
              <Link to="/dashboard" className="hideOnMobile">
                <small>Dashboard</small>
              </Link>
              <Link to="/login">
                <small>Logout</small>
              </Link>
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
