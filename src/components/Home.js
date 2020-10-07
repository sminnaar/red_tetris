import React, { useState } from "react";
import { Link } from "react-router-dom";

import { StyledHomeWrapper, StyledHome, StyledJoinButton } from './styles/StyledHome'

import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'

import Display from './Display'

const Home = (props) => {

  const [roomName, setRoomName] = useState('');
  const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });

  let error = props.location.state ? props.location.state.error : null;

  const handleRoomNameChange = (event) => {
    setRoomName(event.target.value);
  };

  return (
    <StyledHomeWrapper >
      <StyledHome>
        <input
          type="text"
          placeholder="Room"
          value={roomName ? roomName : ''}
          onChange={handleRoomNameChange}
        // className="text-input-field"
        />

        <StyledJoinButton>
          {roomName ? (
            < Link to={{
              pathname: `/${roomName}[${randomName}]`,
              state: {
                room: roomName,
                name: randomName,
                error: null,
              }
            }}>Join</Link>
          ) : (
              <div>< Display text='Please enter a room name' /></div>
              // <div>< Display text={error ? error : error = null && 'room'} /></div>
            )

          }
          {error ? <div> <Display text={error} /> </div> : <div></div>}
        </StyledJoinButton>
      </StyledHome>
    </StyledHomeWrapper >
  );
};

export default Home;
