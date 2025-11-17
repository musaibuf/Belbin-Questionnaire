const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cors = require('cors');
const path = require('path'); // Use the 'path' module for robust file paths

const app = express();
app.use(cors());
app.use(express.json());

// --- The Correct, Robust Credential Loading Method ---
const secretDir = process.env.RENDER_SECRETS_DIR;

// If RENDER_SECRETS_DIR exists, we are on Render. Otherwise, we are local.
const credentialsPath = secretDir
  ? path.join(secretDir, 'credentials.json') // On Render
  : './credentials.json';                   // Locally

console.log(`Attempting to load credentials from: ${credentialsPath}`);
const creds = require(credentialsPath);

// Initialize the JWT client using the loaded credentials
const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// IMPORTANT: We will use a separate environment variable for the Sheet ID.
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

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