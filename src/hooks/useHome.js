import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080";

const useLobby = (roomId) => {

    const [error, setError] = useState('');
    const socketRef = useRef();

    useEffect(() => {

        socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
            query: { roomId },
        });

        socketRef.current.on("ping", () => {
            setError("ping")
            console.log('Pinging')
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [error, roomId]);


    const pong = () => {
        console.log('Ponging')
        socketRef.current.emit('pong', () => {
            setError("pong")
        });
    };


    return { error, pong };
};

export default useLobby;