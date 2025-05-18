let socket;
let username = '';
let selectedUserId = null;

const loginContainer = document.getElementById('login-container');
const chatBox = document.getElementById('chat-box');
const joinBtn = document.getElementById('join-btn');
const nameInput = document.getElementById('username');

const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const usersList = document.getElementById('users');

joinBtn.addEventListener('click', () => {
  username = nameInput.value.trim();
  if (!username) return alert('Enter a username');

  loginContainer.style.display = 'none';
  chatBox.style.display = 'block';

  socket = io();

  socket.emit('join', username);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = input.value;
    const time = new Date().toLocaleTimeString();

    if (msg && selectedUserId) {
      socket.emit('private message', {
        to: selectedUserId,
        msg,
      });
      addMessage(`You (${time}): ${msg}`);
      input.value = '';
    }
  });

  socket.on('update users', (userList) => {
    usersList.innerHTML = '';
    userList.forEach((user) => {
      if (user.id === socket.id) return;

      const li = document.createElement('li');
      li.textContent = user.name;
      li.dataset.id = user.id;

      li.addEventListener('click', () => {
        selectedUserId = user.id;
        document.querySelectorAll('#users li').forEach((el) => el.classList.remove('active'));
        li.classList.add('active');
        messages.innerHTML = '';
      });

      usersList.appendChild(li);
    });
  });

  socket.on('private message', (data) => {
    addMessage(`${data.from} (${data.time}): ${data.msg}`);
  });
});

function addMessage(text) {
  const item = document.createElement('li');
  item.textContent = text;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}
