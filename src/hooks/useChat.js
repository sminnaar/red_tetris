import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

// import { usePlayer } from './usePlayer';

// import { useStage } from './useStage';


const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const SOCKET_SERVER_URL = "http://localhost:8080";

// const [player] = usePlayer();
// console.log(player);


const useChat = (roomId, player) => {

  // console.log(player);
  const [messages, setMessages] = useState([]);
  const [move, setMove] = useState(player)
  // const { piece } = usePiece();
  const socketRef = useRef();



  // console.log(`Socket Ref: ${socketRef.current}`);
  // console.log(socketRef.current);

  useEffect(() => {
    socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
      query: { roomId },
    });

    socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, (message) => {
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current.id,
      };
      setMessages((messages) => [...messages, incomingMessage]);
    });

    socketRef.current.on('player move', (move) => {
      const incomingMove = {
        ...move,
        ownedByCurrentUser: move.senderId === socketRef.current.id,
      };
      setMove((move) => [...move, incomingMove]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [socketRef, move, roomId]);

  const sendMessage = (messageBody) => {
    socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
      body: messageBody,
      senderId: socketRef.current.id,
    });
  };

  return { messages, sendMessage, };
};

export default useChat;
