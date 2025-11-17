const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cors = require('cors');
const fs = require('fs'); // We need the 'fs' module to check if a file exists

const app = express();
app.use(cors());
app.use(express.json());

// --- Smart Credential Loading ---
// Render places secret files at '/etc/secrets/'. We check if that file exists.
const RENDER_SECRET_PATH = '/etc/secrets/credentials.json';
const LOCAL_SECRET_PATH = './credentials.json';

// Determine which path to use
const credentialsPath = fs.existsSync(RENDER_SECRET_PATH) ? RENDER_SECRET_PATH : LOCAL_SECRET_PATH;
console.log(`Loading credentials from: ${credentialsPath}`);
const creds = require(credentialsPath);

// Initialize the JWT client using the loaded credentials
const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(creds.sheet_id || process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

// Function to test connection
async function initializeSheet() {
    try {
        await doc.loadInfo();
        console.log(`Connected to sheet: ${doc.title}`);
    } catch (error) {
        console.error('Failed to connect to Google Sheets:', error.message);
    }
}

initializeSheet();

// API endpoint
app.post('/submit-belbin', async (req, res) => {
    try {
        const { name, organization, responses } = req.body;
        const sheet = doc.sheetsByIndex[0];

        const newRow = {
            Timestamp: new Date().toLocaleString(),
            Name: name,
            Organization: organization,
        };

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