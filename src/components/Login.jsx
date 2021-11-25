import React, { useContext, useEffect } from "react";
import "../App.css";
import GoogleLogin from "react-google-login";
import { Navigate } from "react-router-dom";
import { config } from "../config";
import { asyncLocalStorage } from "../helpers";
import { UserContext } from "../context/UserContext";

// manage oauth creds here: https://console.developers.google.com/apis/credentials?project=stakeholders-accountability&organizationId=351974971548

const Login = () => {
  const { loggedIn, setLoggedIn, setToken } = useContext(UserContext);

  const responseGoogle = async res => {
    if (!res || !res.profileObj) {
      return;
    }

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
      // log token to console if running in dev mode
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        console.log(json);
      }
      await asyncLocalStorage.setItem("token", json.token);
      setToken(json.token);
      // read background color from database & set it
      asyncLocalStorage.setItem("backgroundColor", json.backgroundColor);
      document.body.style.cssText = "background:" + json.backgroundColor + ";";
      // set state.loggedIn to redirect to main page
      setLoggedIn(true);
    } else {
      console.log("Invalid!");
      alert("Sorry, you are unauthorized. Please try again.");
    }
  };

  const devLogin = () => {
    console.log("devLogin called");

    const token = {
      profileObj: {
        givenName: "Jake"
      },
      tokenObj: {
        id_token: "123456"
      }
    };

    responseGoogle(token);
  };

  useEffect(() => {
    // clear local storage whenever login page is visited
    setLoggedIn(false);
    setToken("");
    localStorage.removeItem("token");
  }, [setLoggedIn, setToken]);

  if (loggedIn) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="App">
      <div className="App-wrapper">
        <div id="login-wrapper">
          <GoogleLogin
            clientId="473172367004-l02vesjv7pnj0lgi53agg5dbbjd5b9s5.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={"single_host_origin"}
          />
          {process.env.NODE_ENV === "development" && (
            <div onClick={devLogin}>Dev login</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
