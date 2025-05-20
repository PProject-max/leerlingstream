module.exports = (req, res) => {
  const token = req.query.token;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const timestamp = new Date().toISOString();

  console.log("TOEGANG:", { token, ip, timestamp });

  // Simpele redirect (pas dit aan met je eigen Cloudflare Stream link)
  if (!token) return res.status(400).send("Token ontbreekt.");
  return res.writeHead(302, { Location: "https://iframe.videodelivery.net/aba37fd842136c39cfea52786d8c1545" }).end();
};
