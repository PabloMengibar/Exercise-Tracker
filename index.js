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
  const parsedDuration = parseInt(duration);

  // Validate duration
  if (isNaN(parsedDuration) || parsedDuration <= 0) {
    return res.status(400).json({ error: 'Invalid duration' });
  }

  let newDate;
  if (date) {
    newDate = new Date(date);
    // Check if the date is valid
    if (isNaN(newDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date' });
    }
  } else {
    newDate = new Date();
  }

  const newExercise = {
    username: getUserById(_id).username, // Get the username associated with the user ID
    description,
    duration: parsedDuration,
    date: newDate.toDateString(), // Format the date using toDateString method
    _id: _id, // Use the same user ID for the exercise
  };

  exercises.push(newExercise);

  // Add the new exercise to the user object
  const userIndex = users.findIndex(user => user._id === _id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  users[userIndex].log = users[userIndex].log || [];
  users[userIndex].log.push(newExercise);

  res.json(newExercise); // Return the new exercise object
});

// Retrieve full exercise log for a user
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  let { from, to, limit } = req.query;

  // Filter exercises by user ID
  let userExercises = exercises.filter(exercise => exercise._id === _id);

  // Filter exercises by date range (if from and to parameters are provided)
  if (from && to) {
    userExercises = userExercises.filter(exercise => {
      const exerciseDate = new Date(exercise.date);
      return exerciseDate >= new Date(from) && exerciseDate <= new Date(to);
    });
  }

  // Limit number of exercises (if limit parameter is provided)
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  // Format date property as string using the dateString format of the Date API
  userExercises.forEach(exercise => {
    exercise.date = new Date(exercise.date).toDateString();
  });

  const count = userExercises.length;
  res.json({ _id, count, log: userExercises });
});

// Helper function to generate user IDs
function generateUserId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Helper function to get user by ID
function getUserById(id) {
  return users.find(user => user._id === id);
}

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
});
