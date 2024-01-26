const axios = require("axios");
const cheerio = require("cheerio");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

exports.handler = async (event) => {
  const target_url = event.target_url.S;
  const channel_id = event.channel_id.S;
  const webhook_url = event.webhook_url.S;

  // Extract listing ids from target_url
  const listing_ids = await axios
    .get(target_url, {
      headers: {
        "User-Agent": "XXX",
      },
    })
    .then((response) => {
      const $ = cheerio.load(response.data);
      return extractIds($);
    });

  // Create params to send to DynamoDB
  const putParams = listing_ids.map((listing_id) => {
    return {
      TableName: process.env.LISTING_TABLE_ARN,
      Item: {
        channel_id: { S: channel_id },
        listing_id: { S: listing_id },
        webhook_url: { S: webhook_url },
        ttl: { N: getTTL() },
      },
    };
  });
  // Send params to DynamoDB
  const putPromises = putParams.map((item) => {
    return new Promise((resolve, reject) => {
      dynamodb.putItem(item, (err, data) => {
        if (data) {
          resolve(data);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  });

  await Promise.allSettled(putPromises);
};

function extractIds($) {
  // Assumes all listings are in HTML divs with data-testid='listing-card-{listing_id}'

  return $("div")
    .find("div[data-testid^='listing-card-']")
    .toArray()
    .map((item) => {
      return item.attribs["data-testid"].split("-").pop();
    });
}

function getTTL() {
  return (Math.floor(Date.now() / 1000) + 60 * 60).toString(); // Unix time in seconds after an hour
}
