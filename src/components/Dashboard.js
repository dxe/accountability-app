import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import "../App.css";
import { dashboardStartDate, config } from "../config";
import { asyncLocalStorage } from "../helpers";
import {Loading} from "./Loading";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("none");
  const [data, setData] = useState([]);
  const today = moment(new Date()).format("YYYY-MM-DD");
  const nineDaysAgo = moment(new Date())
    .add(-9, "days")
    .format("YYYY-MM-DD");

  useEffect(() => {
    (async () => {
      setToken(await asyncLocalStorage.getItem("token"));
    })();
  });

  useEffect(() => {
    const getDashboardData = async () => {
      const res = await fetch(
        config.url.API_URL +
          `/accomplishments/dashboard?start_date=${nineDaysAgo}&end_date=${today}`,
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: token
          }
        }
      );
      return res.json();
    };

    (async () => {
      if (token === "none") return;
      const dashboardData = await getDashboardData();
      setData(dashboardData);
      setLoading(false);
    })();
  }, [token, nineDaysAgo, today]);

  if (loading) {
    return (<Loading />)
  }

  return (
    <div className="App">
      <div className="App-wrapper">
        <div className="dashboard-wrapper">
          <Link to="/" className="nav">
            Go back
          </Link>
          <table>
            <tbody>
              {data.map((user, userIndex) => (
                <tr key={user.id + userIndex}>
                  <td>{user.firstName}</td>
                  {user.data.map((day, dayIndex) => (
                    <td
                      key={day.date + dayIndex}
                      className={
                        dayIndex < data[0].data.length - 2
                          ? "hideOnMobile"
                          : "showOnMobile"
                      }
                    >
                      {userIndex === 0 ? (
                        moment(day.date).format("MM/DD")
                      ) : day.text ? (
                        <span role="img" aria-label="check">
                          ✅
                        </span>
                      ) : day.date !== today ? (
                        <span role="img" aria-label="X">
                          {day.date >= dashboardStartDate ? "❌" : ""}
                        </span>
                      ) : (
                        <span>⏱</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
