module.exports = { validate_target_url };
const axios = require("axios");
async function validate_target_url(target_url) {
  const url = new URL(target_url);
  if (url.protocol != "https:") {
    throw new Error(`Protocol ${url.protocol} is not supported!`);
  }
  if (url.host != "www.carousell.sg") {
    throw new Error(`Host ${url.host} is not supported!`);
  }

  // Sort by recent
  const newSearchParams = new URLSearchParams(url.searchParams);
  newSearchParams.delete("sort_by");
  newSearchParams.append("sort_by", "3");
  url.search = newSearchParams;

  const html = await axios
    .get(url, {
      headers: {
        "User-Agent": "XXX",
      },
    })
    .catch((err) => {
      throw new Error("Failed to get from URL!");
    });

  return url.href;
}
