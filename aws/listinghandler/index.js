const axios = require("axios");
const { listenerCount } = require("process");
function getListingDetails(listing_id) {
  return axios
    .get(
      `https://carousell.sg/ds/listing-detail/3.1/listings/${listing_id}/detail/?country_code=SG`,
      {
        headers: { "User-Agent": "XXX" },
      }
    )
    .then((response) => {
      console.log(response);
      return response.data.data.screens[0].meta.default_value;
    });
}
function conditionCodetoString(conditionCode) {
  switch (conditionCode) {
    case 3:
      return "Brand new";
    case 4:
      return "Like new";
    case 7:
      return "Lightly used";
    case 5:
      return "Well used";
    case 6:
      return "Heavily used";
    default:
      return "Unknown condition";
  }
}
async function createEmbed(listing_id, listing_details) {
  const title = listing_details.title;
  const price =
    listing_details.currency_symbol + listing_details.price_formatted;
  const condition = conditionCodetoString(listing_details.layered_condition);

  const url = `https://carousell.sg/p/${listing_id}`;
  const image_url = listing_details.photos.find(
    (photo) => photo.is_primary
  ).image_url;

  const time_created = Math.floor(
    new Date(listing_details.time_created).getTime() / 1000
  ); // Unix in s

  const embed = {
    title: title,
    description: `${price}\n${condition}\n<t:${time_created}:R>`,
    url: url,
    image: {
      url: image_url,
    },
  };
  console.log(embed);
  return embed;
}
function sendEmbed(embed, webhook_url) {
  return axios.post(webhook_url, { embeds: [embed] });
}
async function processRecord(record) {
  if (record.eventName != "INSERT") {
    console.log(record.eventName);
    return;
  }
  const item = record.dynamodb.NewImage;
  const listing_id = item.listing_id.S;
  const webhook_url = item.webhook_url.S;
  const channel_id = item.channel_id.S;

  return getListingDetails(listing_id)
    .then((listing_details) => createEmbed(listing_id, listing_details))
    .then((embed) => sendEmbed(embed, webhook_url));
}
exports.handler = async (event) => {
  const processPromises = event.Records.map(processRecord);
  await Promise.allSettled(processPromises);
};
