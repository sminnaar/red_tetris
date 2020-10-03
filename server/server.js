
// import { joinRoom, leaveRooms, checkScore, beginRound } from './classes/Game'

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

const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 8080;

const rooms = {};



/**
 * The starting point for a user connecting to our lovely little multiplayer
 * server!
 */
io.on('connection', (socket) => {

  // give each socket a random identifier so that we can determine who is who when
  // we're sending messages back and forth!
  socket.id = uuid();
  console.log('a user connected');

  /**
   * Lets us know that players have joined a room and are waiting in the waiting room.
   */
  socket.on('ready', () => {
    console.log(socket.id, "is ready!");
    const room = rooms[socket.roomId];
    // when we have two players... START THE GAME!
    if (room.sockets.length == 2) {
      // tell each player to start the game.
      for (const client of room.sockets) {
        client.emit('initGame');
      }
    }
  });

  /**
   * The game has started! Give everyone their default values and tell each client
   * about each player
   * @param data we don't actually use that so we can ignore it.
   * @param callback Respond back to the message with information about the game state
   */
  socket.on('startGame', (data, callback) => {
    const room = rooms[socket.roomId];
    if (!room) {
      return;
    }
    const others = [];
    for (const client of room.sockets) {
      client.x = 0;
      client.y = 0;
      client.score = 0;
      if (client === socket) {
        continue;
      }
      others.push({
        id: client.id,
        x: client.x,
        y: client.y,
        score: client.score,
        isIt: false,
      });
    }

    // Tell the client who they are and who everyone else is!
    const ack = {
      me: {
        id: socket.id,
        x: socket.x,
        y: socket.y,
        score: socket.score,
        isIt: false,
      },
      others
    };

    callback(ack);

    // Start the game in 5 seconds
    setTimeout(() => {
      beginRound(socket, null);
    }, 5000);
  });

  /**
   * Gets fired every time a player has moved! Then forward that message to everyone else!
   * @param data A JSON string that represents the x and y position of the player that moved. Needs to be parsed!
   */
  socket.on('moved', (data) => {
    data = JSON.parse(data);
    const room = rooms[socket.roomId];
    if (!room) {
      return;
    }
    socket.x = data.x;
    socket.y = data.y;
    // Tell everyone else about their updated position!
    for (const client of room.sockets) {
      if (client == socket) {
        continue;
      }
      client.emit(socket.id, {
        x: socket.x,
        y: socket.y,
        score: socket.score,
        isIt: socket.isIt
      });
    }
  });

  /**
   * Gets fired when the players collide! The round is over!
   */
  socket.on('collide', (id) => {
    beginRound(socket, id);
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
    rooms[room.id] = room;
    // have the socket join the room they've just created.
    joinRoom(socket, room);
    callback();
  });

  /**
   * Gets fired when a player has joined a room.
   */
  socket.on('joinRoom', (roomId, callback) => {
    const room = rooms[roomId];
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