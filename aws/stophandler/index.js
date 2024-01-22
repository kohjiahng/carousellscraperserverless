const { globalHandler } = require("../handlerpackage");
const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const action = async (body) => {
  channel_id = body.channel_id;

  const params = {
    TableName: process.env.TABLE_ARN,
    Key: {
      channel_id: { S: channel_id },
    },
    ReturnValues: "ALL_OLD",
  };

  deletePromise = new Promise((resolve, reject) => {
    dynamodb.deleteItem(params, (err, data) => {
      if (data) {
        console.log(data);
        resolve(data);
      } else {
        reject(err);
      }
    });
  });

  deletePromise = deletePromise
    .then((response) => {
      if (!response.Attributes) {
        return { content: "Bot is not running!" };
      } else {
        return { content: "Bot Stopped!" };
      }
    })
    .catch((err) => {
      console.log(err);
      return { content: "Something went wrong :(" };
    });

  return await deletePromise;
};
exports.handler = (event) => {
  globalHandler(event, action);
};
