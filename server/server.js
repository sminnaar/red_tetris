const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const uuid = require('uuid/v1');
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

const rooms = {};
const users = {};

const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketIo(server);


// ----------------

const joinRoom = (socket, room) => {
  console.log(room)
  room.sockets.push(socket);

  socket.join(room.id, () => {
    // store the room id in the socket for future use
    socket.roomId = room.id;
    console.log(socket.id, "Joined", room.id);
  });
};

const leaveRooms = (socket) => {
  const roomsToDelete = [];
  for (const id in rooms) {
    const room = rooms[id];
    // check to see if the socket is in the current room
    if (room.sockets.includes(socket)) {
      socket.leave(id);
      // remove the socket from the room object
      room.sockets = room.sockets.filter((item) => item !== socket);
    }
    // Prepare to delete any rooms that are now empty

    if (room.sockets.length == 0) {
      roomsToDelete.push(room);
    }
  }

  // Delete all the empty rooms that we found earlier
  for (const room of roomsToDelete) {
    delete rooms[room.id];
  }
};

// ----------------

io.on('connection', (socket) => {
  // give each socket a random identifier so that we can determine who is who when
  // we're sending messages back and forth!
  socket.id = uuid();
  console.log(`Client ${socket.id} connected`);

  /**
   * Gets fired when a player joins a room.
   */
  socket.on('joinRoom', (roomName, userName, callback) => {
    const user = {
      id: uuid(),
      name: userName,
    };
    users[user.name] = new Player(user, user.id, user.name, null);
    if (!rooms[roomName]) {
      room = {
        id: uuid(),
        name: roomName,
        sockets: []
      };
      rooms[room.name] = new Game(room, room.id, room.name, room.sockets);
      joinRoom(socket, room);
    } else {
      room = rooms[roomName];
      joinRoom(socket, room);
    }
    callback();
  });

  /**
   * Gets fired when a player leaves a room.
   */
  socket.on('leaveRoom', () => {
    leaveRooms(socket);
  });

  /**
   * Gets fired when a player disconnects from the server.
   */
  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} disconnected`);
    leaveRooms(socket);
  });

});

server.listen(port, () => console.log(`Listening on port ${port}`));