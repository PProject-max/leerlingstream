https://leerlingstream.vercel.app/view?token=abc123&email=naam@school.nl

const crypto = require('crypto');

const accessLog = {}; // Tijdelijk in geheugen

function isExpired(timestamp) {
  const now = Date.now();
  return now - timestamp > 7 * 24 * 60 * 60 * 1000; // ouder dan 7 dagen
}

module.exports = (req, res) => {
  const { token, email } = req.query;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!token || !email) {
    return res.status(400).send("Token of e-mailadres ontbreekt.");
  }

  // Unieke ID per leerling-token combinatie
  const key = `${email}::${token}`;

  // Init log voor deze gebruiker
  if (!accessLog[key]) {
    accessLog[key] = {
      createdAt: Date.now(),
      ips: new Set(),
    };
  }

  // Check geldigheid
  const log = accessLog[key];

  if (isExpired(log.createdAt)) {
    return res.status(403).send("Deze link is verlopen.");
  }

  // Voeg IP toe
  log.ips.add(ip);

  if (log.ips.size > 3) {
    return res.status(403).send("Je hebt deze link al op te veel apparaten gebruikt.");
  }

  // ✅ Toegang toegestaan
  return res.writeHead(302, {
    Location: "https://iframe.videodelivery.net/aba37fd842136c39cfea52786d8c1545"
  }).end();
};
