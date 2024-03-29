const { globalHandler } = require("../handlerpackage");
const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const action = async (body) => {
  channel_id = body.channel_id;

  const params = {
    TableName: process.env.REQUEST_TABLE_ARN,
    Key: {
      channel_id: { S: channel_id },
    },
    ReturnValues: "ALL_OLD", // To check if item existed
  };

  deletePromise = new Promise((resolve, reject) => {
    dynamodb.deleteItem(params, (err, data) => {
      if (data) {
        resolve(data);
      } else {
        console.log(err);
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
