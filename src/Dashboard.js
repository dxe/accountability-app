import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import "./App.css";
import { config } from './config'
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      yesterday: moment(new Date())
        .add(-1, "days")
        .format("YYYY-MM-DD"),
      twoWeeksAgo: moment(new Date())
        .add(-14, "days")
        .format("YYYY-MM-DD")
    };
  }

  async getDashboardData() {
    const res = await fetch(
      config.url.API_URL + `/accomplishments/dashboard?start_date=${this.state.twoWeeksAgo}&end_date=${this.state.yesterday}`,
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
    await this.setState({ loading: true });
    //console.log(this.state);

    const dashboardData = await this.getDashboardData();
    this.setState({
      data: dashboardData,
      loading: false
    });
    //console.log(this.state);
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="App">
          <div className="App-wrapper">
            <Loader
              type="Circles"
              color="#00BFFF"
              height={100}
              width={100}
              timeout={5000} //3 secs
            />
          </div>
        </div>
      );
    }

    return (
      <div className="App">
        <div className="App-wrapper">
          <div id="dashboard-wrapper">
            <table>
              <tbody>
                {this.state.data.map((user, userIndex) => (
                  <tr key={user.id + userIndex}>
                    <td>{user.firstName}</td>
                    {user.data.map((day, dayIndex) => (
                      <td key={day.date + dayIndex}>
                        {userIndex === 0 ? (
                          moment(day.date).format("MM/DD")
                        ) : day.text ? (
                          <span role="img" aria-label="check">
                            ✅
                          </span>
                        ) : (
                          <span role="img" aria-label="X">
                            ❌
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <br />

            <Link to="/">
              <small>Go back</small>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
