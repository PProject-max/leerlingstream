const { google } = require("googleapis");

const tokens = {
  "abc123": {
    email: "leerling1@school.nl",
    created: "2025-05-20",
    uses: [],
    maxUses: 3
  },
  "def456": {
    email: "leerling2@school.nl",
    created: "2025-05-20",
    uses: [],
    maxUses: 3
  }
};

module.exports = async (req, res) => {
  const token = req.query.token;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const timestamp = new Date().toISOString();

  if (!token || !tokens[token]) {
    return res.status(400).send("Ongeldig of ontbrekend token.");
  }

  const data = tokens[token];
  const age = (new Date() - new Date(data.created)) / (1000 * 60 * 60 * 24);
  if (age > 7) return res.status(403).send("Deze link is verlopen.");

  if (!data.uses.includes(ip)) {
    data.uses.push(ip);
  }

  if (data.uses.length > data.maxUses) {
    return res.status(403).send("Maximaal aantal apparaten overschreden.");
  }

  // 🟢 Loggen naar Google Sheets
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: "1PIuVOTWIleJcADwjMpOXWMBG342LQoLNfIhISbZX6qY",
    range: "Sheet1!A:D",
    valueInputOption: "RAW",
    requestBody: {
      values: [[token, data.email, ip, timestamp]]
    }
  });

  console.log("TOEGANG:", { token, ip, timestamp });

  return res.writeHead(302, {
    Location
