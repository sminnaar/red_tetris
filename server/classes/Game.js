class Game {
  constructor(room) {
    this.roomId = room.roomId;
    this.users = room.users;
    this.winner = '';
  }
}

module.exports.Game = Game;