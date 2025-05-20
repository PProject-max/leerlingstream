// Simpele geheugenopslag (reset bij elke Vercel deploy)
const tokens = {
  "abc123": {
    email: "leerling1@example.com",
    created: "2025-05-20",
    uses: [], // hier komen IP-adressen
    maxUses: 3
  },
  "def456": {
    email: "leerling2@example.com",
    created: "2025-05-20",
    uses: [],
    maxUses: 3
  }
};

module.exports = (req, res) => {
  const token = req.query.token;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const timestamp = new Date().toISOString();

  if (!token || !tokens[token]) {
    return res.status(400).send("Ongeldig of ontbrekend token.");
  }

  const tokenData = tokens[token];
  const createdDate = new Date(tokenData.created);
  const now = new Date();
  const daysSince = (now - createdDate) / (1000 * 60 * 60 * 24);

  if (daysSince > 7) {
    return res.status(403).send("Deze link is verlopen.");
  }

  if (!tokenData.uses.includes(ip)) {
    tokenData.uses.push(ip);
  }

  if (tokenData.uses.length > tokenData.maxUses) {
    return res.status(403).send("Maximaal aantal apparaten overschreden.");
  }

  console.log("TOEGANG:", { token, email: tokenData.email, ip, timestamp });

  return res.writeHead(302, {
    Location: "https://iframe.videodelivery.net/aba37fd842136c39cfea52786d8c1545"
  }).end();
};
