/* TemplateKaizer by KaizerDev — свободно модифицируй под себя */
/* Лицензия MIT */
const host = location.host;
const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${host}`);

const chat = document.getElementById('chat');
const form = document.getElementById('form');
const senderInput = document.getElementById('sender');
const textInput = document.getElementById('text');

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  const div = document.createElement('div');
  div.className = 'message';
  div.innerHTML = `<b>${msg.sender}</b>: ${msg.text} <span>[${new Date(msg.timestamp).toLocaleTimeString()}]</span>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const sender = senderInput.value.trim();
  const text = textInput.value.trim();
  if (!sender || !text) return;

  ws.send(JSON.stringify({ sender, text }));
  textInput.value = '';
});
