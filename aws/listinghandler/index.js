const axios = require("axios");
const { createEmbed, isRecentListing } = require("./listings_utils.js");

exports.handler = async (event) => {
  const processPromises = event.Records.map(processRecord);
  await Promise.allSettled(processPromises);
};

async function processRecord(record) {
  if (record.eventName != "INSERT") {
    // console.log(record.eventName);
    return;
  }
  const item = record.dynamodb.NewImage;
  const listing_id = item.listing_id.S;
  const webhook_url = item.webhook_url.S;
  const channel_id = item.channel_id.S;

  const listing_details = await getListingDetails(listing_id);
  if (!isRecentListing(listing_details)) {
    return;
  }
  return createEmbed(listing_id, listing_details).then((embed) =>
    axios.post(webhook_url, { embeds: [embed] })
  );
}

function getListingDetails(listing_id) {
  return axios
    .get(
      `https://carousell.sg/ds/listing-detail/3.1/listings/${listing_id}/detail/?country_code=SG`,
      {
        headers: { "User-Agent": "XXX" },
      }
    )
    .then((response) => {
      return response.data.data.screens[0].meta.default_value;
    });
}
