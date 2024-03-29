const axios = require("axios");
const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

exports.handler = async (event) => {
  const channel_id = event.channel_id;
  const getResponse = await getWebhook(channel_id);

  if (getResponse.Item) {
    return { statusCode: 200, webhook_url: getResponse.Item.webhook_url.S };
  } else {
    const webhook_url = await createWebhook(channel_id);
    await uploadWebhook(channel_id, webhook_url);
    return { statusCode: 200, webhook_url: webhook_url };
  }
};

function getWebhook(channel_id) {
  // Checks if there is a webhook in channel in the Table
  const getParams = {
    TableName: process.env.WEBHOOK_TABLE_ARN,
    Key: {
      channel_id: { S: channel_id },
    },
  };
  return new Promise((resolve, reject) => {
    dynamodb.getItem(getParams, (err, data) => {
      if (data) {
        resolve(data);
      } else {
        console.log(err);
        reject(err);
      }
    });
  });
}
function createWebhook(channel_id) {
  // Creates a webhook on discord through a POST request
  return axios
    .post(
      `https://discord.com/api/v10/channels/${channel_id}/webhooks`,
      {
        name: "CarousellScraper",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    )
    .then((response) => response.data.url);
}
function uploadWebhook(channel_id, webhook_url) {
  // Puts webhook into Table
  const putParams = {
    TableName: process.env.WEBHOOK_TABLE_ARN,
    Item: {
      channel_id: { S: channel_id },
      webhook_url: { S: webhook_url },
    },
  };
  return new Promise((resolve, reject) => {
    dynamodb.putItem(putParams, (err, data) => {
      if (data) {
        resolve(data);
      } else {
        console.log(err);
        reject(err);
      }
    });
  });
}
