import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080";

const useHome = (userName) => {

    // const [userName, setUserName] = useState('');
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
            query: { userName },
        });

        socketRef.current.on('joinRoom', (roomId) => {
            const incomingMessage = {
                ...message,
                ownedByCurrentUser: message.senderId === socketRef.current.id,
            };
            setMessages((messages) => [...messages, incomingMessage]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId]);

    const sendMessage = (messageBody) => {
        socketRef.current.emit('chat', {
            body: messageBody,
            senderId: socketRef.current.id,
        });
    };

    return { messages, sendMessage };
};

export default useLobby;