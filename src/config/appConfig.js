const port = process.env.PORT || 3000;
const jwtSecret = "my-jwt-secret-key";
const tibiaDataAPI = "https://dev.tibiadata.com/v4";

module.exports = {
  port,
  jwtSecret,
  tibiaDataAPI,
};
