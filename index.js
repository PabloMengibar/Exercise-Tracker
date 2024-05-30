const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static('public'));

// Sample data (Replace with your database implementation)
let users = [];
let exercises = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = { _id: generateUserId(), username };
  users.push(newUser);
  res.json(newUser);
});

// Get a list of all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercise for a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const newExercise = { _id, description, duration: parseInt(duration), date: date || new Date().toISOString() };
  exercises.push(newExercise);
  res.json(newExercise);
});

// Retrieve full exercise log for a user
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const userExercises = exercises.filter(exercise => exercise._id === _id);
  const count = userExercises.length;
  res.json({ _id, count, log: userExercises });
});

// Helper function to generate user IDs
function generateUserId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
});
