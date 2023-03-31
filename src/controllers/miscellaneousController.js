const axios = require("axios");
const { tibiaDataAPI } = require("../config/appConfig");

async function getRashidLocation() {
  const dayCityMap = {
    monday: "Svargrond",
    tuesday: "Liberty Bay",
    wednesday: "Port Hope",
    thursday: "Ankrahmun",
    friday: "Darashia",
    saturday: "Edron",
    sunday: "Carlin",
  };
  const date = new Date();
  const dayName = date
    .toLocaleDateString("en", { weekday: "long" })
    .toLowerCase();
  return dayCityMap[dayName];
}

async function getBoostedBoss() {
  const bosses = await axios.get(`${tibiaDataAPI}/boostablebosses`);
  const json = await bosses.json();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return json.boostable_bosses;
}

async function getBoostedMonster() {
  const creatures = await axios.get(`${tibiaDataAPI}/creatures`);
  const json = await creatures.json();
  return json.creatures;
}

async function getWorlds(req, res) {
  const response = await axios.get(`${tibiaDataAPI}/worlds`).catch(() => {
    return res.status(500).json({
      message: `Error while fetching worlds`,
    });
  });
  const { worlds = [] } = response.data;
  return res.status(200).json({
    worlds,
  });
}

async function getCharacterInfo(characterName) {
  const characterInfo = await axios.get(
    `${tibiaDataAPI}/character/${characterName}`
  );
  return characterInfo;
}

module.exports = {
  getRashidLocation,
  getBoostedBoss,
  getBoostedMonster,
  getWorlds,
  getCharacterInfo,
};
