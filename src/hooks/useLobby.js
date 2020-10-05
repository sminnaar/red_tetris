import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080";

const useLobby = () => {

    const [joined, setJoined] = useState(false);
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = socketIOClient(SOCKET_SERVER_URL);
        socketRef.current.on('joinRoom', (error, data) => {
            if (error) {
                setJoined(false);
            }
            else if (data) {
                setJoined(true);
            }
        });
        // return () => {
        // socketRef.current.disconnect();
        // };
        // }, []);
    }, [setJoined]);

    const joinRoom = (roomName, userName) => {
        socketRef.current.emit('joinRoom', roomName, userName, () => {
            setJoined(true);
            console.log('Joined!')
        });
    };

    return { joined, joinRoom };
};

export default useLobby;