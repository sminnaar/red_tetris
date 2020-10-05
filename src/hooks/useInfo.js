import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080";

const useInfo = () => {

    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);

    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = socketIOClient(SOCKET_SERVER_URL);

        socketRef.current.on('getInfo', (error, data) => {
            setRooms(data);
            setUsers(data);
        });
        // return () => {
        //     socketRef.current.disconnect();
        // };
    }, []);

    const getInfo = () => {
        socketRef.current.emit('getInfo', 'data', (roomNames, userNames) => {
            setRooms(roomNames)
            setUsers(userNames)
            console.log('Get!')
        });
    };

    return { rooms, users, getInfo };
};

export default useInfo;