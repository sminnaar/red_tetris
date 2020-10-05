class Game {
  constructor(room, id, name, sockets) {
    this.room = room;
    this.id = id;
    this.name = name;
    this.sockets = sockets;
  }
}

module.exports.Game = Game;