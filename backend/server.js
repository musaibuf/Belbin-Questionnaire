const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

// --- START: BELBIN SCORING LOGIC ---
const scoringKey = {
    SH: { A: 3, B: 1, C: 7, D: 2, E: 6, F: 6, G: 5 },
    CO: { A: 7, B: 6, C: 4, D: 3, E: 5, F: 4, G: 7 },
    PL: { A: 4, B: 5, C: 6, D: 6, E: 1, F: 5, G: 6 },
    RI: { A: 6, B: 8, C: 2, D: 4, E: 7, F: 1, G: 3 },
    ME: { A: 5, B: 4, C: 3, D: 5, E: 3, F: 3, G: 2 },
    IMP: { A: 1, B: 7, C: 5, D: 1, E: 4, F: 8, G: 1 },
    TW: { A: 8, B: 3, C: 8, D: 8, E: 2, F: 7, G: 8 },
    F: { A: 2, B: 2, C: 1, D: 7, E: 8, F: 2, G: 4 },
};

function calculateRoles(responses) {
    const roleTotals = { SH: 0, CO: 0, PL: 0, RI: 0, ME: 0, IMP: 0, TW: 0, F: 0 };
    for (const role in scoringKey) {
        for (const section in scoringKey[role]) {
            const questionNumber = scoringKey[role][section];
            const questionId = `${section}${questionNumber}`;
            if (responses[section] && responses[section][questionId]) {
                roleTotals[role] += responses[section][questionId];
            }
        }
    }
    return Object.entries(roleTotals).sort(([, a], [, b]) => b - a);
}
// --- END: BELBIN SCORING LOGIC ---

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
        
        // Calculate roles before creating the row
        const sortedRoles = calculateRoles(responses);
        const primaryRole = sortedRoles[0] ? sortedRoles[0][0] : 'N/A';
        const secondaryRole = sortedRoles[1] ? sortedRoles[1][0] : 'N/A';

        const newRow = {
            Timestamp: new Date().toLocaleString(),
            Name: name,
            Organization: organization,
            'Primary Role': primaryRole,    // New column
            'Secondary Role': secondaryRole,  // New column
        };
        
        // Add all the individual scores after the roles
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