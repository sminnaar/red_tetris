import React, { useState } from "react";
import { Link } from "react-router-dom";

import { StyledHomeWrapper, StyledHome, StyledJoinButton } from './styles/StyledHome'

import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'

// import useHome from "../hooks/useHome";

const Home = (props) => {

  const [roomName, setRoomName] = useState('');
  const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });

  // const [test, setTest] = useState('');
  // const { error, pong } = useHome(roomName);
  console.log(props.location.state)

  const handleRoomNameChange = (event) => {
    if (event.target.value)
      setRoomName(event.target.value);
  };

  // const handlePong = () => {
  //   pong();
  //   setTest(error)
  //   console.log(error)
  // };

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
        {props.location.state ? <div>{props.location.state.error}</div> : <div></div>}
        <StyledJoinButton>
          <Link to={`/${roomName}[${randomName}]`} className="enter-room-button">
            Join room
          </Link>
        </StyledJoinButton>
        {/* 
        <button onClick={handlePong} className="input-button">
          Pong
        </button> */}



      </StyledHome>
    </StyledHomeWrapper >
  );
};

export default Home;
