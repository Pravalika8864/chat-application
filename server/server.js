const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

const users = {}; // socket.id -> username

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    users[socket.id] = username;
    updateUserList();
  });

  socket.on('private message', ({ to, msg }) => {
    const fromUser = users[socket.id];
    const time = new Date().toLocaleTimeString();
    if (to && users[to]) {
      io.to(to).emit('private message', {
        from: fromUser,
        msg,
        time,
      });
    }
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    updateUserList();
  });

  function updateUserList() {
    const userList = Object.keys(users).map((id) => ({
      id,
      name: users[id],
    }));
    io.emit('update users', userList);
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

