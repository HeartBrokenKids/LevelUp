const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;


const serviceAccount = require('./assets/key/certi.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'levelup-eccd9.appspot.com'
});

// Serve static files from the current directory and assets folder
app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint to handle student registration with file upload
app.post('/register-student', async (req, res) => {
  const { email, password, fullName, college, number } = req.body;

  if (!email || !password || !fullName || !college || !number) {
    return res.status(400).send("All fields are required.");
  }

  const mobileNumberPattern = /^[0-9]{10}$/;
  if (!mobileNumberPattern.test(number)) {
    return res.status(400).send("Invalid mobile number format.");
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password });
    const userId = userRecord.uid;

    await db.collection('users').doc(userId).set({
      fullName,
      email,
      college,
      number,
      role: 'student'
    });
    res.status(200).send('Student registered successfully!');
  } catch (error) {
    res.status(500).send(`Error registering student: ${error.message}`);
  }
});

// Endpoint to handle company registration
app.post('/register-company', async (req, res) => {
  const { companyName, email, password, mobileNumber } = req.body;

  const mobileNumberPattern = /^[0-9]{10}$/;
  if (!mobileNumberPattern.test(mobileNumber)) {
    return res.status(400).send("Invalid mobile number format.");
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password });
    const userId = userRecord.uid;

    await db.collection('users').doc(userId).set({
      companyName,
      email,
      mobileNumber,
      role: 'company'
    });

    res.status(200).send('Company registered successfully!');
  } catch (error) {
    res.status(500).send(`Error registering company: ${error.message}`);
  }
});

// Endpoint to verify user's authentication token and role
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Received login request:', email);

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('User authentication successful:', userRecord.uid);

    const userId = userRecord.uid;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      console.log('User document not found in Firestore:', userId);
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    console.log('User data fetched from Firestore:', userData);

    const role = userData.role;
    res.status(200).json({ message: 'Login successful', role, userId });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Login failed', error: error.message });
  }
});

// Handle all GET requests to the root path by sending the courses.html file
app.get('/courses', (req, res) => {
  res.sendFile(path.join(__dirname, 'courses.html'));
});

// Handle GET requests to /jobs path by sending the jobs.html file
app.get('/jobs', (req, res) => {
  res.sendFile(path.join(__dirname, 'opportunities.html'));
});

app.get('/user_dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'user_dashboard.html'));
});

// Endpoint to handle PDF file uploads and send them to Flask server
app.post('/upload-pdf', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    // Create a FormData object to send the file
    const form = new FormData();
    form.append('resume', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Send the file to the Flask server
    const response = await axios.post('http://localhost:5000/extract_skills', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error sending file to Flask server:', error);
    res.status(500).send('Error processing file.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
