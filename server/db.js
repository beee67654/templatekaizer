const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./kaizer.db');

// Создаём таблицу, если её нет
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    text TEXT,
    timestamp INTEGER,
    status TEXT
  )
`, (err) => {
  if (err) {
    console.error('Ошибка создания таблицы:', err);
  } else {
    console.log('Таблица messages готова');
  }
});

function saveMessage(sender, text, timestamp) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO messages (sender, text, timestamp, status) VALUES (?, ?, ?, ?)');
    stmt.run(sender, text, timestamp, 'delivered', function(err) {
      if (err) return reject(err);
      
      const getStmt = db.prepare('SELECT * FROM messages WHERE id = ?');
      getStmt.get(this.lastID, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  });
}

module.exports = { saveMessage };
