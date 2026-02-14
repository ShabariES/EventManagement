const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Basic Route
const path = require('path');
// ...
app.use(express.static(path.join(__dirname, '../')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/templates', require('./routes/templates'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
