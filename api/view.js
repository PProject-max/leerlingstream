const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SHEET_ID = '1PluVOTWlleJcADwjMpOXWMBG342LQoLNfIhISbZX6qY'; // <-- jouw Google Sheet ID
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

const accessLog = {}; // In-memory opslag

function isExpired(timestamp) {
  return Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000; // ouder dan 7 dagen
}

module.exports = async (req, res) => {
  const { token, email } = req.query;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!token || !email) {
    return res.status(400).send("Token of e-mailadres ontbreekt.");
  }

  const key = `${email}::${token}`;
  if (!accessLog[key]) {
    accessLog[key] = {
      createdAt: Date.now(),
      ips: new Set(),
    };
  }

  const log = accessLog[key];

  if (isExpired(log.createdAt)) {
    return res.status(403).send("Deze link is verlopen.");
  }

  log.ips.add(ip);
  if (log.ips.size > 3) {
    return res.status(403).send("Je hebt deze link al op te veel apparaten gebruikt.");
  }

  // Google Sheets loggen
  try {
    const auth = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      timestamp: new Date().toISOString(),
      email,
      token,
      ip,
    });
  } catch (err) {
    console.error('Fout bij loggen naar Google Sheets:', err);
  }

  // Doorsturen naar video
  return res.writeHead(302, {
    Location: "https://iframe.videodelivery.net/aba37fd842136c39cfea52786d8c1545"
  }).end();
};
