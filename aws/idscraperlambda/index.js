const axios = require("axios");
const cheerio = require("cheerio");
function extractIds($) {
  return $("div")
    .find("div[data-testid^='listing-card-']")
    .toArray()
    .map((item) => {
      return $(item)
        .find("a")
        .toArray()[1]
        .attribs["href"].split("/")[2]
        .split("-")
        .pop();
    });
}

exports.handler = async (event) => {
  target_url = event.target_url.S;
  channel_id = event.channel_id.S;

  console.log(event);

  const item_ids = await axios
    .get(target_url, {
      headers: {
        "User-Agent": "XXX",
      },
    })
    .then((response) => {
      const $ = cheerio.load(response.data);
      return extractIds($);
    });

  console.log(item_ids);
};
