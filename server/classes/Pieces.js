class Pieces {
  constructor() {
    this.TETROMINOS = {
      0: { shape: [[0]], color: '50,50,50' },
      I: { shape: [[0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0],], color: '200, 25, 144', },
      J: { shape: [[0, 'J', 0], [0, 'J', 0], ['J', 'J', 0]], color: '255, 102, 5', },
      L: { shape: [[0, 'L', 0], [0, 'L', 0], [0, 'L', 'L']], color: '240, 38, 39', },
      O: { shape: [['O', 'O'], ['O', 'O']], color: '255, 90, 92', },
      S: { shape: [[0, 'S', 'S'], ['S', 'S', 0], [0, 0, 0]], color: '245, 20, 146', },
      T: { shape: [[0, 'T', 0], ['T', 'T', 'T'], [0, 0, 0]], color: '240, 90, 20', },
      Z: { shape: [['Z', "Z", 0], [0, 'Z', 'Z'], [0, 0, 0]], color: '255, 10, 90', },
    }
  }

  randomTetromino() {
    const tetrominos = 'IJLOSTZ';
    const randTetromino =
      tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return this.TETROMINOS[randTetromino];
  }
}

module.exports.Pieces = Pieces;