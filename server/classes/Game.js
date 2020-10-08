class Game {
  constructor(room) {
    this.roomId = room.roomId;
    this.users = room.users;
    this.winner = '';
    this.leader = room.users[0].socket;
    this.start = false;

  }
}

module.exports.Game = Game;