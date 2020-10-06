import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080";

export const useTetris = (roomId, userId) => {

  const [messages, setMessages] = useState([]);
  const [opponentStage, setOpponentMove] = useState([])

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
      query: { roomId, userId },
    });

    socketRef.current.on('chat', (message) => {
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current.id,
      };
      setMessages((messages) => [...messages, incomingMessage]);
    });

    socketRef.current.on('stage', (move) => {
      console.log(move)
      const incomingMove = {
        ...move,
        ownedByCurrentUser: move.senderId === socketRef.current.id,
      };
      if (move.senderId != socketRef.current.id)
        setOpponentMove(incomingMove);
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

  const sendStage = (myStage) => {
    socketRef.current.emit('stage', {
      body: myStage,
      senderId: socketRef.current.id,
    });
  };

  return { messages, sendMessage, sendStage, opponentStage };
};

// export default useTetris;
