const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory and assets folder
app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Handle all GET requests to the root path by sending the courses.html file
app.get('/courses', (req, res) => {
    res.sendFile(path.join(__dirname, 'courses.html'));
});

// Handle GET requests to /jobs path by sending the jobs.html file
app.get('/jobs', (req, res) => {
    res.sendFile(path.join(__dirname, 'jobs.html'));
});

app.get('/user_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'jobs.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
