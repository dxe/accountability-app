import React from "react";
import "./App.css";
import GoogleLogin from "react-google-login";
import { Redirect } from "react-router-dom";
import { config } from './config'
import { asyncLocalStorage } from './helpers'

// manage oauth creds here: https://console.developers.google.com/apis/credentials?project=stakeholders-accountability&organizationId=351974971548

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false
    };
  }

  responseGoogle = async res => {
    console.log(`Thank you, ${res.profileObj.givenName}`);

    // pass token to our api to make sure it's a valid user
    const auth = await fetch(config.url.API_URL + "/users/auth", {
      method: "POST",
      body: JSON.stringify({ token: res.tokenObj.id_token }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
    const json = await auth.json();

    // store the token in local storage
    if (json.token) {
      console.log("Valid!");
      //console.log(json);
      await asyncLocalStorage.setItem("token", json.token);
      // read background color from database & set it
      localStorage.setItem("backgroundColor", json.backgroundColor);
      document.body.style = ('background:' + json.backgroundColor + ';');
      // set state.loggedIn to redirect to main page
      this.setState({ loggedIn: true });
    } else {
      console.log("Invalid!");
      alert("Sorry, you are unauthorized. Please try again.");
    }
  };

  render() {
    if (this.state.loggedIn) {
      return <Redirect to="/" />;
    }

    // clear local storage whenever login page is visited
    localStorage.removeItem("token");

    return (
      <div className="App">
        <div className="App-wrapper">
          <div id="login-wrapper">
            <GoogleLogin
              clientId="473172367004-l02vesjv7pnj0lgi53agg5dbbjd5b9s5.apps.googleusercontent.com"
              buttonText="Login"
              onSuccess={this.responseGoogle}
              onFailure={this.responseGoogle}
              cookiePolicy={"single_host_origin"}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
