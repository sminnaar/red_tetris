
const moment = require("moment");

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const routes = require("./routes/index");

app.use(routes);

const server = http.createServer(app);
const io = socketIo(server);

const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
  setStartGame,
  users,
  startGame,
  genTetrominoArr,
  deadUser
} = require('./lib/userHelper');

const port = process.env.PORT || 8080;

let chatters = [];
io.on("connection", (socket) => {

  socket.on("login", (userName) => {
    chatters.push({ id: socket.id, userName: userName, connectionTime: new moment().format("YYYY-MM-DD HH:mm:ss") });
    socket.emit("connecteduser", JSON.stringify(chatters[chatters.length - 1]));
    io.emit("chatters", JSON.stringify(chatters));
  });

  socket.on("sendMsg", msgTo => {
    msgTo = JSON.parse(msgTo);
    const minutes = new Date().getMinutes();
    io.emit("getMsg",
      JSON.stringify({
        id: socket.id,
        userName: chatters.find(e => e.id == msgTo.id).userName,
        msg: msgTo.msg,
        time: new Date().getHours() + ":" + (minutes < 10 ? "0" + minutes : minutes)
      }));
  });

  // socket.once("disconnect", () => {
  //   let index = -1;
  //   if (chatters.length >= 0) {
  //     index = chatters.findIndex(e => e.id == socket.id);
  //   }
  //   if (index >= 0)
  //     chatters.splice(index, 1);
  //   io.emit("chatters", JSON.stringify(chatters));
  // });

  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      return callback(error)
    } else {
      socket.join(room);
      io.to(room).emit("updateUsers", users.filter((user) => user.room === room));
    }

  });

  socket.on("gameStart", (room) => {
    io.to(room).emit("gameStarted", startGame(room));
  });

  socket.on('genTetrominoArr', (room) => {
    const tetroArr = genTetrominoArr();
    io.to(room).emit("tetrominoArr", tetroArr);
  });

  socket.on("setBoard", (stage) => {
    let user = getUser(socket.id);
    users.map((user) => {
      if (user.id === socket.id) {
        user.board = [...stage];
      }
    });
    // 
    let room = user.room;
    io.to(room).emit("updateUsers", users.filter((user) => user.room === room));
  });

  socket.on("winner", (champ) => {
    if (champ) {
      io.to(champ.room).emit("winner", { champ, users });
    }
  });

  socket.on("deadUser", (id) => {
    let user = getUser(id);
    let room = user.room;
    io.to(room).emit("deadUser", deadUser(id));
  });

  socket.on("clearRow", () => {
    // 
    let user = getUser(socket.id);
    let room = user.room;
    if (room) {
      socket.to(room).emit("addRow")
    }
  })

  socket.on("disconnect", () => {
    let index = -1;
    if (chatters.length >= 0) {
      index = chatters.findIndex(e => e.id == socket.id);
    }
    if (index >= 0)
      chatters.splice(index, 1);
    io.emit("chatters", JSON.stringify(chatters));

    ///

    const user = removeUser(socket.id);

    if (user) {
      let room = user.room;
      if (user.inGame) {
        io.to(room).emit("deadUser", deadUser(socket.id));
      } else {
        let usersInRoom = users.filter((user) => user.room === room);
        if (usersInRoom.length > 0) {
          io.to(room).emit("updateUsers", usersInRoom);
        }
      }
    }
  });

});

server.listen(port, () => console.log(`Listening on port ${port}`));