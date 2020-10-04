import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080";

const useLobby = () => {

    const [rooms, setRooms] = useState([]);

    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = socketIOClient(SOCKET_SERVER_URL);

        socketRef.current.on('getRoomNames', (error, data) => {
            setRooms(data);
        });
        // return () => {
        //     socketRef.current.disconnect();
        // };
    }, []);

    const getRooms = () => {
        socketRef.current.emit('getRoomNames', 'data', (roomNames) => {
            setRooms(roomNames)
            console.log('Get!')
        });
    };

    return { rooms, getRooms };
};

export default useLobby;