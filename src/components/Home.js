import React from "react";
import { Link } from "react-router-dom";

import { StyledHomeWrapper, StyledHome } from './styles/StyledHome'
import { StyledButton } from './styles/StyledButton'

import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'

const Home = () => {

  const [roomName, setRoomName] = React.useState("");
  const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });

  const handleRoomNameChange = (event) => {
    if (event.target.value)
      setRoomName(event.target.value);
  };

  return (
    <StyledHomeWrapper >
      <StyledHome>
        <input
          type="text"
          placeholder="Room"
          value={roomName}
          onChange={handleRoomNameChange}
        />
        <StyledButton>
          <Link to={`/${roomName}[${randomName}]`}>
            Join room
        </Link>
        </StyledButton>
      </StyledHome>
    </StyledHomeWrapper >
  );
};

export default Home;
