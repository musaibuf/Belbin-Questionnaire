const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cors = require('cors');

// --- Direct Authentication Setup ---
// Load credentials from the JSON file
const creds = require('./credentials.json'); 

const app = express();
app.use(cors()); // Allow requests from your frontend
app.use(express.json());

// Initialize the JWT client using the credentials file
const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Initialize the GoogleSpreadsheet object with the sheet ID and auth client
const doc = new GoogleSpreadsheet('1aUSFbuo-AKVAW8hi62pv59L9PUTc-hjxPFRQ0YJ-AGE', serviceAccountAuth);

// Function to test connection and load sheet info
async function initializeSheet() {
    try {
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(`Connected to sheet: ${doc.title}`);
    } catch (error) {
        console.error('Failed to connect to Google Sheets:', error);
    }
}

initializeSheet();

// API endpoint to receive data
app.post('/submit-belbin', async (req, res) => {
    try {
        const { name, organization, responses } = req.body;
        const sheet = doc.sheetsByIndex[0]; // Assumes you're writing to the first sheet

        // Prepare the row data
        const newRow = {
            Timestamp: new Date().toLocaleString(),
            Name: name,
            Organization: organization,
        };

        // Add each question's score as a new column
        for (const sectionId in responses) {
            for (const questionId in responses[sectionId]) {
                newRow[`${questionId}_Score`] = responses[sectionId][questionId] || 0;
            }
        }

        await sheet.addRow(newRow);
        res.status(200).send('Data submitted successfully!');
    } catch (error) {
        console.error('Error writing to sheet:', error);
        res.status(500).send('Error submitting data');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});