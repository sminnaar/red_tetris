
// import { joinRoom, leaveRooms, checkScore, beginRound } from './classes/Game'

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require('path');

const Game = require('./classes/Game').Game
const Player = require('./classes/Player').Player
const Pieces = require('./classes/Pieces').Pieces

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

io.on("connection", (socket) => {

  console.log(`Client ${socket.id} connected`);

  const { roomId, userId } = socket.handshake.query;
  // console.log(`Server roomId: ${roomId}`);
  // console.log(`Server userId: ${userId}`);

  // Rooms, Users and Joining 
  if (roomId && userId) {
    user = {
      socket: socket.id,
      userId: userId,
      gameId: false,
    };
    users[user.userId] = new Player(user);

    if (!rooms[roomId]) {
      room = {
        roomId: roomId,
        users: [user]
      };
      rooms[roomId] = new Game(room);
      // console.log("Created: ");
      // console.log(rooms[roomId]);
      socket.join(roomId);
    }
    else {
      if (rooms[roomId].users.length === 2) {
        socket.emit('full', (data) => {
          io.to(socket.id).emit('full');
        })
      } else {
        rooms[roomId].users.push(user);
        socket.join(roomId);
        // console.log("Added: ");
        // console.log(rooms[roomId].users);
      }
    }
  }

  // Listen for new messages
  socket.on('chat', (data) => {
    io.in(roomId).emit('chat', data);
  });

  // Listen for new game events
  socket.on('stage', (data) => {
    // console.log('Sent Player move')
    // console.log(data.body);
    io.in(roomId).emit('stage', data);
  });

  socket.on('dead', (data) => {
    // console.log('Sent Player is dead')
    // console.log(data);
    rooms[data.roomId].winner = rooms[data.roomId].users.filter(x => x.socket != data.senderId);
    // console.log(rooms[data.roomId]);
    io.in(roomId).emit('dead', data.senderId);
  });

  socket.on('start', (room) => {
    let Piece = new Pieces();
    let pieces = [];
    let i = 0;
    while (i < 50) {
      pieces.push(Piece.randomTetromino());
      i++;
    }
    console.log('setStart');
    io.to(roomId).emit('setStart', pieces);
  });

  socket.on('end', (room) => {
    console.log('setEnd');
    io.to(roomId).emit('setEnd');
  });

  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} disconnected`);

    if (roomId && userId) {

      const roomsToDelete = [];
      for (const roomId in rooms) {
        var room = rooms[roomId];
        // check to see if the socket is in the current room
        // if (room.users.includes(socket)) {
        if (room.users.some(user => user.socket === socket.id)) {
          room.users = room.users.filter((user) => user.socket !== socket.id);
          socket.leave(roomId);
          // console.log("Left: ");
          // console.log(rooms[roomId].users);
          // console.log("Object found inside the array.");
        }
      }
      // Prepare to delete any rooms that are now empty
      // console.log(room.users.length === 0);
      // console.log(room);
      if (room.users.length == 0) {
        // console.log("EMPTY found")
        roomsToDelete.push(room);
      }
      // Delete all the empty rooms that we found earlier
      for (const room of roomsToDelete) {
        // console.log("DELTING:")
        // console.log(rooms[room.roomId]);
        // console.log("ROOMS:")
        delete rooms[room.roomId];
      }
      // console.log(rooms);

    }

  });

});

server.listen(port, () => console.log(`Listening on port ${port}`));