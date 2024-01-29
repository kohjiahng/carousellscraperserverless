module.exports = { createEmbed, isRecentListing };
const conditionCodes = {
  3: "Brand new",
  4: "Like new",
  7: "Lightly used",
  5: "Well used",
  6: "Heavily used",
};

async function createEmbed(listing_id, listing_details) {
  const title = listing_details.title;
  const price =
    listing_details.currency_symbol + listing_details.price_formatted;

  const condition =
    conditionCodes[listing_details.layered_condition] || "Unknown condition";

  const url = `https://carousell.sg/p/${listing_id}`;
  const image_url = listing_details.photos.find(
    (photo) => photo.is_primary
  ).image_url;

  const time_created = Math.floor(
    new Date(listing_details.time_created).getTime() / 1000
  ); // Unix in s
  
  const description = listing_details.description
  const embed = {
    title: title,
    description: `${price}\n${condition}\n<t:${time_created}:R>\n\n${description}`,
    url: url,
    image: {
      url: image_url,
    },
  };
  return embed;
}

function isRecentListing(listing_details) {
  // filter for whether to send listing
  const secondsSince = Math.floor(
    (Date.now() - new Date(listing_details.time_created).getTime()) / 1000
  );
  return secondsSince <= 60 * 60; // <= 1h ago
}
