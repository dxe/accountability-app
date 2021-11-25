import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { config } from "../config";
import TextareaAutosize from "react-autosize-textarea";
import PropTypes from "prop-types";
import { useDebouncedCallback } from "use-debounce";
import { UserContext } from "../context/UserContext";
// TODO: implement warning if user tries to change or close page before saving has finished (use websockets first)
// import { Beforeunload } from "react-beforeunload";

export const Accomplishment = ({ selectedUser, loggedInUser, initialData }) => {
  const [id, setID] = useState("");
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const yesterday = moment(new Date())
    .add(-1, "days")
    .format("YYYY-MM-DD");
  const { token } = useContext(UserContext);

  useEffect(() => {
    setID(initialData._id);
    setDate(initialData.date);
    setText(initialData.text);
  }, [initialData]);

  const debouncedSaveAccomplishment = useDebouncedCallback(async reqBody => {
    try {
      const resp = await fetch(config.url.API_URL + "/accomplishments/", {
        method: "PUT",
        body: reqBody,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: token
        }
      });

      // TODO: is api returning all accomplishment data here? we will only ever need the ID (at most).
      const json = await resp.json();
      setID(json._id);
      console.log("Saved accomplishment.");
      setSaved(true);
    } catch (e) {
      console.warn("Error saving data!");
      alert(
        "Sorry, there was an error saving your data! Please contact support."
      );
    }
  }, 250);

  const updateText = event => {
    // if loggedInUser is not the selected user, then don't allow any changes
    if (loggedInUser.id !== selectedUser)
      return alert(
        "Sorry, you may not edit accomplishments belonging to other users."
      );

    // if date is before yesterday, then don't allow any changes
    if (moment.utc(date).format("YYYY-MM-DD") < yesterday)
      return alert(
        "Sorry, you may not edit your accomplishments from dates prior to yesterday."
      );

    // if date is yesterday, then only allow changes it current time is less than 9:30
    if (
      moment.utc(date).format("YYYY-MM-DD") === yesterday &&
      moment(new Date()).format("HHmm") > "1200"
    )
      return alert(
        "Sorry, you may not edit yesterday's accomplishments after 12pm."
      );

    setText(event.target.value);

    (async () => {
      setSaved(false);

      const reqBody = JSON.stringify({
        // TODO: consider updating api to just always use the user & date instead of updating up by id
        id: id,
        text: event.target.value,
        user: selectedUser,
        date: date
      });

      debouncedSaveAccomplishment(reqBody);
    })();
  };

  return (
    <div className="accomplishment">
      {selectedUser === loggedInUser.id &&
      moment.utc(date).format("YYYY-MM-DD") ===
        moment(new Date()).format("YYYY-MM-DD")
        ? `What did you do today, ${moment.utc(date).format("dddd, MMMM Do")}?`
        : moment.utc(date).format("dddd, MMMM D")}
      <br />
      <TextareaAutosize
        className="accomplishment-text"
        value={text}
        onChange={updateText}
      />
      {saved ? <span className="saved-message">Saved</span> : ""}
      <br />
      <br />
    </div>
  );
};

Accomplishment.propTypes = {
  selectedUser: PropTypes.string,
  loggedInUser: PropTypes.object,
  initialData: PropTypes.object
};
