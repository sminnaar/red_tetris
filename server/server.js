const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require('path');

const Game = require('./classes/Game').Game
const Player = require('./classes/Player').Player
const Pieces = require('./classes/Pieces').Pieces

const app = express();

const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketIo(server);

console.log('In Production mode')
const router = express.Router();
router.use(express.static(path.join(__dirname, '../build')));
router.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.use(router);


const rooms = {};
const users = {};

io.on("connection", (socket) => {
  // console.log(`Client ${socket.id} connected`);
  const { roomId, userId } = socket.handshake.query;

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
      socket.join(roomId);
    }
    else {
      if (rooms[roomId].users.length === 2 || rooms[roomId].start) {
        socket.emit('full', (data) => {
          io.to(socket.id).emit('full');
        })
      } else {
        rooms[roomId].users.push(user);
        socket.join(roomId);
      }
    }
  }

  // Listen for new messages
  socket.on('chat', (data) => {
    io.in(roomId).emit('chat', data);
  });

  // Listen for new game events
  socket.on('stage', (data) => {
    io.in(roomId).emit('stage', data);
  });

  // Listen for new game events
  socket.on('clearRow', (data) => {
    io.in(roomId).emit('addRow', data.senderId);
  });

  socket.on('dead', (data) => {
    rooms[data.roomId].winner = rooms[data.roomId].users.filter(x => x.socket != data.senderId);
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
    rooms[roomId].start = true;
    io.to(roomId).emit('setStart', pieces);
  });

  socket.on('getLeader', () => {
    const leader = rooms[roomId].leader;
    io.to(roomId).emit('setLeader', leader);
  });

  socket.on('end', (room) => {
    rooms[roomId].start = false;
    io.to(roomId).emit('setEnd');
  });

  socket.on('disconnect', () => {
    // console.log(`Client ${socket.id} disconnected`);
    if (roomId && userId) {
      const roomsToDelete = [];
      for (const roomId in rooms) {
        var room = rooms[roomId];

        if (room.users.some(user => user.socket === socket.id)) {
          room.users = room.users.filter((user) => user.socket !== socket.id);
          if (room.leader === socket.id && room.users.length === 1) {
            room.leader = room.users[0].socket;
            io.to(roomId).emit('setLeader', room.leader);
          }
          socket.leave(roomId);
          // console.log(room);
        }
      }
      // Prepare to delete any rooms that are now empty
      if (room.users.length == 0) {
        roomsToDelete.push(room);
      }
      // Delete all the empty rooms that we found earlier
      for (const room of roomsToDelete) {
        delete rooms[room.roomId];
      }
    }
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));