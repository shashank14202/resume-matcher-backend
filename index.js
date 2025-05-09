const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const port = 10000;

// Hardcoded credentials (not safe for production)
const MONGO_URI = "mongodb+srv://shashank14202:shashank14202@shashank.k0r1s6s.mongodb.net/?retryWrites=true&w=majority&appName=shashank";
const GEMINI_API_KEY = "AIzaSyC438_5bIi-hKYjviIYua_MkIZq3C4o1iI";

app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription;
    const pdfBuffer = req.file.buffer;

    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    const geminiResponse = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
      contents: [{
        parts: [{
          text: `Compare the following resume to the job description and provide a matching percentage and suggestions:\n\nResume:\n${resumeText}\n\nJob Description:\n${jobDescription}`
        }]
      }]
    });

    const resultText = geminiResponse.data.candidates[0].content.parts[0].text;
    res.status(200).json({ result: resultText });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
