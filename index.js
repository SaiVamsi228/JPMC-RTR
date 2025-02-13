const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Saivamshi)2284',
  database: 'rtr'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/menu', (req, res) => {
  res.render('menu');
});

app.get('/checkout-pattern', (req, res) => {
  connection.query(`
    SELECT books.b_name, COUNT(checkin_checkout.b_id) AS checkout_count
    FROM checkin_checkout
    JOIN books ON checkin_checkout.b_id = books.b_id
    GROUP BY checkin_checkout.b_id
    ORDER BY checkout_count DESC
  `, (err, results) => {
    if (err) throw err;
    res.render('checkout-pattern', { books: results });
  });
});

app.get('/reading-freq', (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  connection.query(`
    SELECT students.s_name, COUNT(checkin_checkout.b_id) AS books_borrowed, 
           AVG(TIMESTAMPDIFF(HOUR, checkin_checkout.check_out_time, checkin_checkout.check_in_time)) AS avg_duration
    FROM checkin_checkout
    JOIN students ON checkin_checkout.s_id = students.s_id
    WHERE checkin_checkout.check_out_time >= ?
    GROUP BY checkin_checkout.s_id
  `, [oneWeekAgo], (err, results) => {
    if (err) throw err;
    res.render('reading-freq', { data: results });
  });
});

app.get('/popular-genres', (req, res) => {
  connection.query(`
    SELECT books.b_genre, COUNT(checkin_checkout.b_id) AS borrow_count
    FROM checkin_checkout
    JOIN books ON checkin_checkout.b_id = books.b_id
    GROUP BY books.b_genre
    ORDER BY borrow_count DESC
  `, (err, results) => {
    if (err) throw err;
    res.render('popular-genres', { genres: results });
  });
});

app.get('/book-types', (req, res) => {
  connection.query(`
    SELECT books.growby_level, COUNT(checkin_checkout.b_id) AS borrow_count
    FROM checkin_checkout
    JOIN books ON checkin_checkout.b_id = books.b_id
    GROUP BY books.growby_level
    ORDER BY borrow_count DESC
  `, (err, results) => {
    if (err) throw err;
    res.render('books-type', { types: results });
  });
});

app.get('/trending-books', (req, res) => {
  connection.query('SELECT * FROM books WHERE availability < 5', (err, results) => {
    if (err) throw err;
    res.render('trending-books', { books: results });
  });
});

app.get('/checkin-stats', (req, res) => {
  connection.query(`
    SELECT 
      DATE(check_in_time) AS return_date,
      COUNT(*) AS books_returned,
      AVG(DATEDIFF(check_in_time, check_out_time)) AS avg_delay,
      SUM(CASE WHEN DATEDIFF(check_in_time, check_out_time) <= 7 THEN 1 ELSE 0 END) AS on_time_returns,
      SUM(CASE WHEN DATEDIFF(check_in_time, check_out_time) > 7 THEN 1 ELSE 0 END) AS delayed_returns
    FROM checkin_checkout
    WHERE check_in_time IS NOT NULL
    GROUP BY DATE(check_in_time)
    ORDER BY return_date DESC
  `, (err, results) => {
    if (err) throw err;
    res.render('checkin-stats', { stats: results });
  });
});

app.get('/checkout', (req, res) => {
  res.render('checkout');
});

app.post('/checkout', (req, res) => {
  const { s_id, b_id } = req.body;
  const check_out_time = new Date();
  connection.query('INSERT INTO checkin_checkout (s_id, b_id, check_out_time) VALUES (?, ?, ?)', [s_id, b_id, check_out_time], (err, results) => {
    if (err) throw err;
    res.redirect('/menu');
  });
});
app.get('/checkin', (req, res) => {
  res.render('check-in');
});
app.post('/checkin', (req, res) => {
  const { s_id, b_id } = req.body;
  const check_in_time = new Date();
  connection.query('UPDATE checkin_checkout SET check_in_time = ? WHERE s_id = ? AND b_id = ? AND check_in_time IS NULL', [check_in_time, s_id, b_id], (err, results) => {
    if (err) throw err;
    res.redirect('/menu');
  });
});

app.get('/borrow-history', (req, res) => {
  connection.query('SELECT * FROM borrow_history', (err, results) => {
    if (err) throw err;
    res.render('borrow-history', { history: results });
  });
});

app.get('/current-borrows', (req, res) => {
  connection.query('SELECT * FROM checkin_checkout WHERE check_in_time IS NULL', (err, results) => {
    if (err) throw err;
    res.render('current-borrows', { borrows: results });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});