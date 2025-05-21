module.exports = (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.status(400).send("Token of e-mailadres ontbreekt.");
  }

  // (optioneel: console.log hier voor debuggen)

  return res.writeHead(302, {
    Location: "https://iframe.videodelivery.net/aba37fd842136c39cfea52786d8c1545"
  }).end();
};
