import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080";

export const useTetris = (roomId, userId) => {

  const [messages, setMessages] = useState([]);
  const [opponentStage, setOpponentMove] = useState([])
  const [full, setFullTest] = useState(false);
  const [opponentDead, setOpponentDead] = useState(false);
  const [leader, setLeader] = useState(false);
  const [start, setStart] = useState(false);
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
      console.log(data);
      if (data !== socketRef.current.id) {
        // console.log('Opponent died!!!!');
        setOpponentDead(true);
      }
    });

    socketRef.current.on('addRow', (data) => {
      console.log("in socket addrow");
      console.log(data);
      if (data !== socketRef.current.id) {
        setAdd(true)
      }
    });

    socketRef.current.on('full', () => {
      setFullTest(true);
    });

    socketRef.current.on('setStart', (pieces) => {
      console.log("useSetStart")
      setStart(true);
      setPieces(pieces)
    });

    socketRef.current.on('setEnd', (data) => {
      console.log("useSetEnd")
      setStart(false);
      // setPieces([]);
      console.log(data);
    });

    socketRef.current.on('setLeader', (userId) => {
      console.log("setLeader")
      console.log(userId);
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
    // console.log('CLIENT: DEAD Player!!!!')
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
    console.log("useStart")
    socketRef.current.emit('start', () => { });
  };

  const endRound = () => {
    console.log("useEnd")
    socketRef.current.emit('end', () => { });
  };

  const getLeader = () => {
    console.log("getLeader")
    socketRef.current.emit('getLeader', () => { });
  };

  const clearRow = () => {
    console.log("clearRow")
    socketRef.current.emit('clearRow', {
      senderId: socketRef.current.id
    });
  };

  return { add, setAdd, clearRow, leader, getLeader, pieces, start, startRound, endRound, opponentDead, full, messages, sendMessage, sendStage, sendGameOver, opponentStage };
};