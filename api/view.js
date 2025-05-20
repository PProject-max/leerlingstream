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
  const spreadsheetId = '1PIuVOTWIleJcADwjMpOXWMBG342LQoLNfIhISbZX6qY';
  const sheetName = 'Blad1'; // of pas aan naar jouw tabbladnaam

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1:D1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[timestamp, email, ip, token]],
      },
    });

    // Succes → doorsturen naar je Cloudflare video
    return res.writeHead(302, {
      Location: "https://iframe.videodelivery.net/aba37fd842136c39cfea52786d8c1545",
    }).end();

  } catch (error) {
    console.error("Google Sheets fout:", error);
    return res.status(500).send("Er is iets misgegaan bij het loggen.");
  }
};
