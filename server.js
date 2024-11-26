
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

const app = express()
app.use(express.json());
app.use(cors());

// Configure session middleware
app.use(session({
  secret: 'ari24xx', 
  resave: false,             
  saveUninitialized: true,   
  cookie: {
    secure: false,           
    maxAge: 1000 * 60 * 60,  
  }
}));

// Database connection
const dbServer = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'expense_tracker'
});

dbServer.connect((err) => {
  if (err) {
    return console.log('Error connecting to the Database Server:', err);
  }
  console.log('Successfully connected to the Database Server');

  // Create tables if not exist
  const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255)
    )`;
  dbServer.query(createUserTable, (err) => {
    if (err) console.log('Error creating users table:', err);
  });

  const createExpensesTable = `
    CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
  dbServer.query(createExpensesTable, (err) => {
    if (err) console.log('Error creating expenses table:', err);
  });
});

// User registration
app.post('/api/user/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    dbServer.query(checkUserQuery, [email], async (err, data) => {
      if (err) return res.status(500).json("Database query error");
      if (data.length > 0) return res.status(409).json("User already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserQuery = 'INSERT INTO users(email, username, password) VALUES (?, ?, ?)';
      dbServer.query(newUserQuery, [email, username, hashedPassword], (err) => {
        if (err) return res.status(400).json("Something went wrong");
        res.status(200).json("User created successfully");
      });
    });
  } catch (err) {
    res.status(500).json("Internal Server Error");
  }
});

// User login
app.post('/api/user/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const findUserQuery = 'SELECT * FROM users WHERE username = ?';
    dbServer.query(findUserQuery, [username], async (err, data) => {
      if (err) return res.status(500).json("Database query error");
      if (data.length === 0) return res.status(400).json("Invalid username or password");

      const user = data[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json("Invalid username or password");

      // Save user information in session
      req.session.user = { id: user.id, username: user.username, email: user.email };
      res.status(200).json({ message: 'Login successful', user: req.session.user });
    });
  } catch (err) {
    res.status(500).json("Internal Server Error");
  }
});

// User logout
app.post('/api/user/logout', (req, res) => {
  console.log("Logout route hit");

  req.session.destroy(err => {
    if (err) return res.status(500).json("Logout failed");
    res.status(200).json("Logged out successfully");
  });
});

// Check if user is logged in
app.get('/api/user/session', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

// Corrected Add Expense Route
app.post('/api/expense/add', (req, res) => {
  console.log("Hello")
  if (!req.session.user) {
    return res.status(401).json({ message: "You must be logged in to add an expense." });
  }
console.log (req.body)
  // Get the expense details from the request body
  const { amount, date, category, description } = req.body; // Include 'description'
  const userId = req.session.user.id;

  // Check if required fields are provided
  if (!amount || !date || !category) {
    return res.status(400).json({ message: "Amount, date, and category are required." });
  }

  // Insert the new expense into the database
  const insertExpenseQuery = `
    INSERT INTO expenses (user_id, amount, date, category, description)
    VALUES (?, ?, ?, ?, ?)`; // Match table columns

  dbServer.query(insertExpenseQuery, [userId, amount, date, category, description || null], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error adding expense to the database." });
    }
    res.status(200).json({ message: "Expense added successfully." });
  });
});

app.get('/api/expenses', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "You must be logged in to view the expenses." });
  }
  const user_id = req.session.user.id;
  dbServer.query('SELECT * FROM expenses WHERE user_id = ?',[user_id],(err,results) => {
    if (err) {
      return res.status(500).json({message: "Error fetching expenses."});
    }
    res.status(200).json(results);
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port 5001`);
});

