const { globalHandler } = require("../handlerpackage");
const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const action = async (body) => {
  const channel_id = body.channel_id;

  const params = {
    TableName: process.env.REQUEST_TABLE_ARN,
    Key: {
      channel_id: { S: channel_id },
    },
  };

  getPromise = new Promise((resolve, reject) => {
    dynamodb.getItem(params, (err, data) => {
      if (data) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });

  getPromise = getPromise
    .then((response) => {
      if (response.Item) {
        return { content: "Bot is running!" };
      } else {
        return { content: "Bot is not running!" };
      }
    })
    .catch((err) => {
      console.log(err);
      return { content: "Something went wrong :(" };
    });

  return await getPromise;
};
exports.handler = (event) => {
  globalHandler(event, action);
};
