import React, { useState } from "react";
import { Link } from "react-router-dom";

import { StyledHomeWrapper, StyledHome, StyledJoinButton } from './styles/StyledHome'

import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'

import Display from './Display'

const Home = (props) => {

  const [roomName, setRoomName] = useState('');
  const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });

  const error = props.location.state ? props.location.state.error : null;

  const handleRoomNameChange = (event) => {
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
          className="text-input-field"
        />
        {error ? <div> <Display text={error} /> </div> : <div></div>}
        <StyledJoinButton>
          <Link to={{
            pathname: `/${roomName}[${randomName}]`,
            state: {
              room: roomName,
              name: randomName,
              error: error,
            }
          }}>Join</Link>
        </StyledJoinButton>
      </StyledHome>
    </StyledHomeWrapper >
  );
};

export default Home;
