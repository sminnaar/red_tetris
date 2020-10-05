const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const uuid = require('uuid/v1');
const path = require('path');

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

const port = process.env.PORT || 8080;

const server = http.createServer(app);
const io = socketIo(server);

/**
 * Will connect a socket to a specified room
 * @param socket A connected socket.io socket
 * @param room An object that represents a room from the `rooms` instance variable object
 */
const joinRoom = (socket, room) => {
  room.sockets.push(socket);
  socket.join(room.id, () => {
    // store the room id in the socket for future use
    socket.roomId = room.id;
    console.log(socket.id, "Joined", room.id);
  });
};

/**
* Will make the socket leave any rooms that it is a part of
* @param socket A connected socket.io socket
*/
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

/**
* Will check to see if we have a game winner for the room.
* @param room An object that represents a room from the `rooms` instance variable object
* @param sendMessage Whether or not to tell each socket if they've won or lost the game
* @returns {boolean} true if we've found a winner. false if we haven't found a winner
*/
const checkScore = (room, sendMessage = false) => {
  let winner = null;
  for (const client of room.sockets) {
    if (client.score >= NUM_ROUNDS) {
      winner = client;
      break;
    }
  }

  if (winner) {
    if (sendMessage) {
      for (const client of room.sockets) {
        client.emit('gameOver', client.id === winner.id ? "You won the game!" : "You lost the game :(");
      }
    }

    return true;
  }

  return false;
};


/**
 * The starting point for a user connecting to our lovely little multiplayer
 * server!
 */
io.on('connection', (socket) => {

  // give each socket a random identifier so that we can determine who is who when
  // we're sending messages back and forth!
  socket.id = uuid();
  console.log(`Client ${socket.id} connected`);

  /**
   * Lets us know that players have joined a room and are waiting in the waiting room.
   */
  socket.on('ready', () => {
    console.log(socket.id, "is ready!");
    const room = rooms[socket.roomId];
    // when we have 6 players... START THE GAME!
    if (room.sockets.length == 6) {
      // tell each player to start the game.
      for (const client of room.sockets) {
        client.emit('initGame');
      }
    }
  });

  /**
   * Gets fired when someone wants to get the list of rooms. respond with the list of room names.
   */
  socket.on('getRoomNames', (data, callback) => {
    const roomNames = [];
    for (const id in rooms) {
      const { name } = rooms[id];
      const room = { name, id };
      roomNames.push(room);
    }
    console.log(roomNames)
    callback(roomNames);
  });

  /**
   * Gets fired when a user wants to create a new room.
   */
  socket.on('createRoom', (roomName, callback) => {
    const room = {
      id: uuid(), // generate a unique id for the new room, that way we don't need to deal with duplicates.
      name: roomName,
      sockets: []
    };
    // rooms[room.id] = room;
    rooms[room.name] = room;

    // have the socket join the room they've just created.
    joinRoom(socket, room);
    callback();
  });

  /**
   * Gets fired when a player has joined a room.
   */
  socket.on('joinRoom', (roomName, callback) => {
    const room = rooms[roomName];
    joinRoom(socket, room);
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
    console.log('user disconnected');
    leaveRooms(socket);
  });

});

server.listen(port, () => console.log(`Listening on port ${port}`));