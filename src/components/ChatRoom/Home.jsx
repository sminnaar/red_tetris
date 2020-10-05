import React from "react";
import { Link } from "react-router-dom";

import "./Home.css";

const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] }); // big_red_donkey


const Home = () => {
  const [roomName, setRoomName] = React.useState("");


  const handleRoomNameChange = (event) => {
    setRoomName(event.target.value);
  };

  return (
    <div className="home-container">
      <input
        type="text"
        placeholder="Room"
        value={roomName}
        onChange={handleRoomNameChange}
        className="text-input-field"
      />
      <Link to={`/${roomName}[${randomName}]`} className="enter-room-button">
        Join room
      </Link>
    </div>
  );
};

export default Home;
