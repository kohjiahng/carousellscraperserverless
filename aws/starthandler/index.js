const { globalHandler } = require("../handlerpackage");
const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const lambda = new AWS.Lambda({ apiVersion: "2015-03-31" });

function callWebhookHandler(channel_id) {
  // calls webhookHandler lambda to retrieve a webhook
  const params = {
    FunctionName: process.env.WEBHOOK_HANDLER_ARN,
    Payload: JSON.stringify({ channel_id: channel_id }),
  };
  invokePromise = new Promise((resolve, reject) => {
    lambda.invoke(params, (err, data) => {
      if (data) {
        console.log(data);
        resolve(data);
      } else {
        console.log(err);
        reject(err);
      }
    });
  });

  return invokePromise;
}
const action = async (body) => {
  const channel_id = body.channel_id;

  let target_url;
  try {
    const url_option = body.data.options.find((option) => option.name == "url");
    target_url = url_option.value;
  } catch (TypeError) {
    target_url =
      "https://www.carousell.sg/categories/cameras-1863/?cameras_type=TYPE_POINT_AND_SHOOT%2CTYPE_DSLR%2CTYPE_MIRRORLESS&searchId=kkZNPc&canChangeKeyword=false&price_end=250&includeSuggestions=false&sort_by=3";
  }
  const webhookPromise = callWebhookHandler(channel_id)
    .then((response) => JSON.parse(response.Payload).webhook_url)
    .catch((err) => {
      console.log(err);
      return null;
    });

  const webhook_url = await webhookPromise;
  console.log(webhook_url);

  if (!webhook_url) {
    return { content: "Bot failed to start :(" };
  }

  const params = {
    TableName: process.env.REQUEST_TABLE_ARN,
    Item: {
      channel_id: { S: channel_id },
      target_url: { S: target_url },
      webhook_url: { S: webhook_url },
    },
  };

  putPromise = new Promise((resolve, reject) => {
    dynamodb.putItem(params, (err, data) => {
      if (data) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });

  putPromise = putPromise
    .then((response) => {
      return { content: "Bot Started!" };
    })
    .catch((err) => {
      console.log(err);
      return { content: "Bot failed to start :(" };
    });

  return await putPromise;
};
exports.handler = (event) => {
  globalHandler(event, action);
};
