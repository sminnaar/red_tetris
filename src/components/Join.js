import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
// import './styles/Input.css';
// import './styles/Join.css';

import socketIOClient from "socket.io-client";
const ENDPOINT = 'http://127.0.0.1:3000';
const socket = socketIOClient(ENDPOINT);

const Join = () => {

  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [submit, setSubmit] = useState(false);

  const joinHandle = (event) => {
    event.preventDefault();

    if (name && room) {
      socket.emit('join', { name, room }, (error) => {
        if (error) {
          alert(error)
          setName('');
          setRoom('');
          setSubmit(false)

          socket.emit("disconnect");
        }

      });
      setSubmit(true)
    }
  }

  const onChangeName = (event) => {
    setName(event.target.value)
  }

  const onChangeRoom = (event) => {
    setRoom(event.target.value)
  }

  if (!submit) {
    return (
      <div className="joinOuterContainer">
        <div className="joinInnerContainer">
          <h1 className="heading">Tetris</h1>
          <form onSubmit={joinHandle}>
            <div><input placeholder="Name" className="joinInput" type="text" value={name} onChange={onChangeName}></input></div>
            <div><input placeholder="Room" className="joinInput mt-20" type="text" value={room} onChange={onChangeRoom}></input></div>
            <button type="submit" className="button mt-20" >Sign In</button>
          </form>
        </div>
      </div>
    )
  } else {
    return (
      <Redirect
        to={{
          pathname: `/${room}[${name}]`,
          state: { room: room, name: name }
        }}
      />
    )
  }
}

export default Join