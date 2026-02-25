require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const internRoutes = require('./routes/internRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/interns', internRoutes);
// This handles the request for the root URL (the homepage)
app.get('/', (req, res) => {
    res.send('Intern Tracker API is running successfully!');
});
// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
