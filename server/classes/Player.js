class Player {
  constructor(user) {
    this.socket = user.socket;
    this.userId = user.userId;
    this.game = user.gameId;
  }
}

module.exports.Player = Player;