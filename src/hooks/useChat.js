import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

// import { usePlayer } from './usePlayer';

// import { useStage } from './useStage';


const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const SOCKET_SERVER_URL = "http://localhost:8080";

// const [player] = usePlayer();
// console.log(player);


const useChat = (roomId) => {

  // console.log(player);
  const [messages, setMessages] = useState([]);
  const [opponentMove, setOpponentMove] = useState([])
  // const [move, setMove] = useState(player)
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
    socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
      body: messageBody,
      senderId: socketRef.current.id,
    });
  };

  const sendPiece = (myStage) => {
    socketRef.current.emit('player move', {
      body: myStage,
      senderId: socketRef.current.id,
    });
  };

  const sendOpponentMove = (opponentMove) => {
    return (opponentMove);
  }

  return { messages, sendMessage, sendPiece, opponentMove };
};

export default useChat;
