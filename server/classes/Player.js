class Player {
  constructor(user) {
    this.socket = user.socket;
    this.userId = user.userId;
  }
}

module.exports.Player = Player;