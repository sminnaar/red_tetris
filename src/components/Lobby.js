import React, { useState, useEffect } from "react";
import { Redirect } from 'react-router-dom';
import useLobby from "../hooks/useLobby";
import userGen from "username-generator"
import "./Lobby.css";

const Lobby = (props) => {

    const [roomName, setRoom] = useState("");
    const [userName, setUser] = useState("");
    const { joined, joinRoom } = useLobby();

    const handleRoomNameChange = (event) => {
        setRoom(event.target.value);
    };

    const handleJoinRooms = () => {
        joinRoom(roomName, userName);
    };

    useEffect(() => {

        setUser(userGen.generateUsername());

        return () => {
            setUser('Default');
        };
    }, []);

    if (!joined) {
        return (
            <>
                <div className="home-container">
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
                </div>
            </>
        );
    } else {
        return (
            <Redirect
                to={{
                    pathname: `/${roomName}[${userName}]`,
                    state: { room: roomName, name: userName }
                }}
            />
        )
    }
};

export default Lobby;