import React, { useState } from "react";
// import { Link } from "react-router-dom";

import { Redirect } from 'react-router-dom';

import "./Lobby.css";
import useLobby from "../hooks/useLobby";
import useRooms from "../hooks/useRooms";

const Lobby = (props) => {

    const [roomName, setRoom] = useState("");
    const [roomNames, setRooms] = useState([]);

    const { joined, joinRoom, createRoom } = useLobby();
    const { rooms, getRooms } = useRooms();

    const handleRoomNameChange = (event) => {
        setRoom(event.target.value);
    };

    const handleJoinRooms = () => {
        joinRoom(roomName);
        console.log("Join")
    };

    const handleGetRooms = () => {
        getRooms();
        console.log("Get")
        setRooms(rooms)
        console.log(rooms)
    };

    const handleCreateRooms = () => {
        createRoom(roomName);
        getRooms();
        setRooms(rooms)
        console.log(rooms)
        console.log("Create")
    };

    if (!joined) {
        return (
            <>
                <div className="home-container">
                    <div className="messages-container">
                        <ol className="messages-list">
                            {rooms.map((room, i) => (
                                <li
                                    key={i}
                                    className={`message-item "my-message"}`}
                                >
                                    {room.name}
                                </li>
                            ))}
                        </ol>
                    </div>
                    <input
                        type="text"
                        placeholder="Room"
                        value={roomName}
                        onChange={handleRoomNameChange}
                        className="text-input-field"
                    />
                    <button onClick={handleJoinRooms} className="input-button">
                        Join
                </button>
                    <button onClick={handleGetRooms} className="input-button">
                        Get
                </button>
                    <button onClick={handleCreateRooms} className="input-button">
                        Create
                </button>
                </div>
            </>
        );
    } else {
        return (
            <Redirect
                to={{
                    pathname: `/${roomName}[user]`,
                    state: { room: roomName, name: 'user' }
                }}
            />
        )
    }
};

export default Lobby;