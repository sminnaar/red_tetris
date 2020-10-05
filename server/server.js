
// import { joinRoom, leaveRooms, checkScore, beginRound } from './classes/Game'

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require('path');

const Game = require('./classes/Game').Game
const Player = require('./classes/Player').Player

const app = express();

if (process.env.NODE_ENV != 'development') {
  console.log('In Production mode')

  const router = express.Router();

  router.use(express.static(path.join(__dirname, '../build')));

  router.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });

  app.use(router);
} else {

  const cors = require('cors');

  var whitelist = ['http:localhost:3000']
  var corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }

  app.use(cors(corsOptions));
}

const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 8080;

const rooms = {};
const users = {};


const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

io.on("connection", (socket) => {

  console.log(`Client ${socket.id} connected`);

  const { roomId, userId } = socket.handshake.query;
  console.log(`Server roomId: ${roomId}`);
  console.log(`Server userId: ${userId}`);

  // Join a room
  user = {
    userId: userId,
  };
  // users[user.userId] = user;
  users[user.name] = new Player(user.userid);

  room = {
    roomId: roomId
  };
  // rooms[room.roomId] = room;
  rooms[room.name] = new Game(roomId);

  socket.join(roomId);

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  // // Listen for new game events
  socket.on('player move', (data) => {
    console.log('Sent Player move')
    console.log(data.body);
    io.in(roomId).emit('player move', data);
  });

  // // Listen for new players
  // socket.on(NEW_PLAYER_JOINED_EVENT, (data) => {
  //   io.in(roomId).emit(NEW_PLAYER_JOINED_EVENT, data);
  // });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} diconnected`);
    socket.leave(roomId);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));