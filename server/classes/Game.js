class Game {
  constructor(room) {
    this.roomId = room.roomId;
    this.users = room.users;
  }
}

module.exports.Game = Game;