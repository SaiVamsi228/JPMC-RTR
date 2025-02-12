const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

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

// Existing routes
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/menu', (req, res) => {
  res.render('menu');
});

app.get('/checkout-pattern', (req, res) => {
  connection.query(`
    SELECT b.b_name, COUNT(c.record_id) AS checkout_count
    FROM books b
    JOIN checkin_checkout c ON b.b_id = c.b_id
    WHERE b.b_genre = "Thriller"
    GROUP BY b.b_name
  `, (err, results) => {
    if (err) throw err;
    res.render('checkout-pattern', { books: results });
  });
});

app.get('/reading-freq', (req, res) => {
  connection.query(`
    SELECT b.b_name, COUNT(c.record_id) AS checkout_count
    FROM books b
    JOIN checkin_checkout c ON b.b_id = c.b_id
    WHERE b.b_genre = "Fiction"
    GROUP BY b.b_name
  `, (err, results) => {
    if (err) throw err;
    res.render('reading-freq', { books: results });
  });
});

app.get('/popular-genres', (req, res) => {
  connection.query(`
    SELECT b.b_name, COUNT(c.record_id) AS checkout_count
    FROM books b
    JOIN checkin_checkout c ON b.b_id = c.b_id
    WHERE b.b_genre = "Fantasy"
    GROUP BY b.b_name
  `, (err, results) => {
    if (err) throw err;
    res.render('popular-genres', { books: results });
  });
});

app.get('/book-types', (req, res) => {
  connection.query(`
    SELECT b.b_name, b.availability
    FROM books b
  `, (err, results) => {
    if (err) throw err;
    res.render('books-type', { books: results });
  });
});

app.get('/trending-books', (req, res) => {
  connection.query(`
    SELECT b.b_name, b.availability
    FROM books b
    WHERE b.availability < 5
  `, (err, results) => {
    if (err) throw err;
    res.render('trending-books', { books: results });
  });
});

// New routes for borrowing, returning, and fetching borrow history

// Borrow a book (Check-In)
app.post('/checkin', (req, res) => {
  const { s_id, b_id } = req.body;
  const checkOutTime = new Date();

  // Check if the book is already borrowed by the student
  connection.query(
    'SELECT * FROM checkin_checkout WHERE s_id = ? AND b_id = ? AND check_in_time IS NULL',
    [s_id, b_id],
    (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        return res.status(400).json({ message: 'Book already borrowed by the student' });
      }

      // Borrow the book
      connection.query(
        'INSERT INTO checkin_checkout (s_id, b_id, check_out_time) VALUES (?, ?, ?)',
        [s_id, b_id, checkOutTime],
        (err, results) => {
          if (err) throw err;
          res.status(200).json({ message: 'Book checked in successfully' });
        }
      );
    }
  );
});

// Return a book (Check-Out)
app.post('/checkout', (req, res) => {
  const { s_id, b_id } = req.body;
  const checkInTime = new Date();

  // Check if the book is borrowed by the student
  connection.query(
    'SELECT * FROM checkin_checkout WHERE s_id = ? AND b_id = ? AND check_in_time IS NULL',
    [s_id, b_id],
    (err, results) => {
      if (err) throw err;

      if (results.length === 0) {
        return res.status(400).json({ message: 'Book not borrowed by the student' });
      }

      // Return the book
      connection.query(
        'UPDATE checkin_checkout SET check_in_time = ? WHERE s_id = ? AND b_id = ? AND check_in_time IS NULL',
        [checkInTime, s_id, b_id],
        (err, results) => {
          if (err) throw err;
          res.status(200).json({ message: 'Book checked out successfully' });
        }
      );
    }
  );
});

// Fetch all borrow history of a student
app.get('/borrow-history/:s_id', (req, res) => {
  const { s_id } = req.params;

  connection.query(
    'SELECT * FROM checkin_checkout WHERE s_id = ?',
    [s_id],
    (err, results) => {
      if (err) throw err;
      res.render('borrow-history', { borrowHistory: results });
    }
  );
});

// Get currently borrowed books (not returned)
app.get('/current-borrowed/:s_id', (req, res) => {
  const { s_id } = req.params;

  connection.query(
    'SELECT * FROM checkin_checkout WHERE s_id = ? AND check_in_time IS NULL',
    [s_id],
    (err, results) => {
      if (err) throw err;
      res.render('current-borrowed', { currentBorrowed: results });
    }
  );
});

// Registration page
app.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration form submission
app.post('/register', (req, res) => {
  const { s_name } = req.body;

  connection.query(
    'INSERT INTO students (s_name) VALUES (?)',
    [s_name],
    (err, results) => {
      if (err) throw err;
      res.redirect('/menu');
    }
  );
});

// Handle login form submission (optional)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Implement your login logic here
  res.redirect('/menu');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});