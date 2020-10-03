/**
 * Will connect a socket to a specified room
 * @param socket A connected socket.io socket
 * @param room An object that represents a room from the `rooms` instance variable object
 */
export const joinRoom = (socket, room) => {
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
export const leaveRooms = (socket) => {
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
export const checkScore = (room, sendMessage = false) => {
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
* At the start of each round, randomize the players positions, determine if
* they should be "IT" or not, and increment the score if necessary
* @param socket A connected socket.io socket
* @param id The id sent by the client that represents the previous "IT" player.
* If its null, we won't increment anyone's score
*/
export const beginRound = (socket, id) => {
  // This is a hack to make sure this function is only being called once during
  // game play. Basically, the client needs to send us the
  if (id && socket.id !== id) {
    return;
  }

  // Get the room
  const room = rooms[socket.roomId];
  if (!room) {
    return;
  }

  // Make sure to cancel the 20 second lose round timer so we make sure we only
  // have one timer going at any point.
  if (room.timeout) {
    clearTimeout(room.timeout);
  }

  // If we've already found a game winner, we don't need to start a new round.
  if (checkScore(room)) {
    return;
  }

  // the different potential spawning positions on the game map. measured in meters.
  let positions = [
    { x: 8, y: 8 },
    { x: 120, y: 8 },
    { x: 120, y: 120 },
    { x: 8, y: 120 }
  ];
  // Shuffle each position... we're going to use some clever trickery to
  // determine where each player should be spawned. Using lodash for the the shuffle
  // functionality.
  positions = _.shuffle(positions);

  // isIt will represent the new socket that will be considered to be "IT"
  let isIt = null;
  // This is going to be a dictionary that we're going to send to every client.
  // the keys will represent the socket ID and the values will be another dictionary
  // that will represent each player.
  const output = {};

  // We're going to loop through each player in the room.
  for (const client of room.sockets) {
    // here is the trickery. We're just going to get the last object in the positions
    // array to get the position for this player. Now there will be one less choice in
    // in the positions array.
    const position = positions.pop();
    client.x = position.x;
    client.y = position.y;
    // if the player was already it, we don't want to make them it again.
    if (client.isIt) {
      // the player won the round! increment their score.
      client.score = id ? client.score + 1 : client.score;
      client.isIt = false;
    }
    // we're going to use lodash's handy isEmpty check to see if we have an IT socket already.
    // if we don't mark the current player as it! mark the as not it just in case.
    else if (_.isEmpty(isIt)) {
      client.isIt = true;
      isIt = client;
    } else {
      client.isIt = false;
    }

    // this is the sub dictionary that represents the current player.
    output[client.id] = {
      x: client.x,
      y: client.y,
      score: client.score,
      isIt: client.isIt
    }
  }

  // After all that madness, check if we have a game winner! If we do, then
  // just return out.
  if (checkScore(room, true)) {
    return;
  }

  // Tell all the players to update themselves client side
  for (const client of room.sockets) {
    client.emit('checkifit', output);
  }

  // Start the round over if the player didn't catch anyone. They've lost the round
  // so decrement their score :(. Note that setTimeout is measured in milliseconds hence
  // the multipication by 1000
  room.timeout = setTimeout(() => {
    if (isIt) {
      isIt.score = isIt.score - 1;
    }
    beginRound(socket, null);
  }, 20 * 1000);

};

// const joinRoom = (socket, room) => {
// export const leaveRooms = (socket) => {
// const checkScore = (room, sendMessage = false) => {
// const beginRound = (socket, id) => {

