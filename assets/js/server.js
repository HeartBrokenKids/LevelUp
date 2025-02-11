const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Firebase Admin SDK initialization
const serviceAccount = require('../key/levelup-eccd9-firebase-adminsdk-p56cx-afb1baba03.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'levelup-eccd9.appspot.com'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/landing', express.static(path.join(__dirname, '../../')));
app.use('/user', express.static(path.join(__dirname, '../../../User')));
app.use('/employer', express.static(path.join(__dirname, '../../../Employer')));


// Configure multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint to handle student registration with file upload
app.post('/register-student', async (req, res) => {
  // Extracting data from request body
  const { email, password, fullName, college, number } = req.body;

  // Simple server-side validation
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

      // Save user details to Firestore
      await db.collection('users').doc(userId).set({
          fullName: fullName || '',  // Ensure no undefined values
          email: email || '',
          college: college || '',
          number: number || '',
          role: 'student'  // Assign the role as 'student'
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

    // Save company details to Firestore
    await db.collection('users').doc(userId).set({
      companyName,
      email,
      mobileNumber,
      role: 'company'  // Assign the role as 'company'
    });

    res.status(200).send('Company registered successfully!');
  } catch (error) {
    res.status(500).send(`Error registering company: ${error.message}`);
  }
});

// Endpoint to verify user's authentication token and role
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      const userId = userRecord.uid;
  
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
  
      const userData = userDoc.data();
      const role = userData.role;
  
      const token = await admin.auth().createCustomToken(userId);
  
      res.status(200).json({ message: 'Login successful', role, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ message: 'Login failed', error: error.message });
    }
  });
  
  
  // Static file serving
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });