const { google } = require('googleapis');

module.exports = async (req, res) => {
  const token = req.query.token;
  const email = req.query.email;

  if (!token || !email) {
    return res.status(400).send("Token of e-mail ontbreekt.");
  }

  const ip =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const timestamp = new Date().toISOString();

  // Loggegevens tonen in Vercel-log
  console.log("TOEGANG:", { token, email, ip, timestamp });

  // Service account ophalen via environment variable
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

  // JWT client aanmaken
  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Sheet-ID van jouw werkende Google Sheet
  const spreadsheetId
