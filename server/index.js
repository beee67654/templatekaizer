// server/index.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, '../public')));

wss.on('connection', (ws) => {
  console.log('Новое подключение к чату');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      const now = Date.now();

      // Обычное сообщение
      if (msg.type === 'message') {
        db.saveMessage(msg.sender, msg.text, now)
          .then(newMsg => {
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'message',
                  sender: msg.sender,
                  text: msg.text,
                  timestamp: now,
                  id: newMsg.id
                }));
              }
            });
          })
          .catch(err => console.error('Ошибка сохранения сообщения:', err));
      }

      // Статус «Печатает»
      else if (msg.type === 'typing') {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'typing', sender: msg.sender }));
          }
        });
      }

      // Статус «Перестал печатать»
      else if (msg.type === 'stop-typing') {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'stop-typing', sender: msg.sender }));
          }
        });
      }

      // Сообщение прочитано
      else if (msg.type === 'read') {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'read',
              messageId: msg.messageId,
              reader: msg.reader
            }));
          }
        });
      }
    } catch (err) {
      console.error('Ошибка обработки сообщения:', err);
    }
  });

  ws.on('close', () => {
    console.log('Клиент отключился');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`TemplateKaizer v0.3 running on http://localhost:${PORT}`);
});
