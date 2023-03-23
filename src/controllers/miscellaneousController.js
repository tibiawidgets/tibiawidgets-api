const axios = require("axios");

async function getEventSchedule(req, res) {
  const url = decodeURIComponent(req.query.url);
  const response = await axios.get(url);
  res.send(response.data);
}

module.exports = { getEventSchedule };
