import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080";

export const useTetris = (roomId, userId) => {

  const [messages, setMessages] = useState([]);
  const [opponentStage, setOpponentMove] = useState([])
  const [full, setFullTest] = useState(false);
  const [leader, setLeader] = useState(false);
  const [start, setStart] = useState(false);
  const [winner, setWinner] = useState(false);
  const [pieces, setPieces] = useState(false);

  const [add, setAdd] = useState(false);

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
      const incomingMove = {
        ...move,
        ownedByCurrentUser: move.senderId === socketRef.current.id,
      };
      if (move.senderId !== socketRef.current.id)
        setOpponentMove(incomingMove);
    });

    socketRef.current.on('dead', (data) => {
      if (data !== socketRef.current.id) {
        setWinner(true);
      }
    });

    socketRef.current.on('addRow', (data) => {
      if (data !== socketRef.current.id) {
        setAdd(true)
      }
    });

    socketRef.current.on('full', () => {
      setFullTest(true);
    });

    socketRef.current.on('setStart', (pieces) => {
      setStart(true);
      setPieces(pieces)
    });

    socketRef.current.on('setEnd', (data) => {
      setStart(false);
    });

    socketRef.current.on('setLeader', (userId) => {
      if (userId === socketRef.current.id)
        setLeader(true);
    });

    return () => {
      socketRef.current.disconnect();
    };

  }, [userId, roomId, full]);

  const sendMessage = (messageBody) => {
    socketRef.current.emit('chat', {
      body: messageBody,
      senderId: socketRef.current.id,
    });
  };

  const sendGameOver = () => {
    socketRef.current.emit('dead', {
      roomId: roomId,
      senderId: socketRef.current.id
    });
  };

  const sendStage = (myStage) => {
    socketRef.current.emit('stage', {
      body: myStage,
      senderId: socketRef.current.id,
    });
  };

  const startRound = () => {
    socketRef.current.emit('start', () => { });
  };

  const endRound = () => {
    socketRef.current.emit('end', () => { });
  };

  const getLeader = () => {
    socketRef.current.emit('getLeader', () => { });
  };

  const clearRow = () => {
    socketRef.current.emit('clearRow', {
      senderId: socketRef.current.id
    });
  };

  return { winner, add, setAdd, clearRow, leader, getLeader, pieces, start, startRound, endRound, full, messages, sendMessage, sendStage, sendGameOver, opponentStage };
};