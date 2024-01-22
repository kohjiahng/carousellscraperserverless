const { globalHandler } = require("../handlerpackage");
const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const action = async (body) => {
  channel_id = body.channel_id;
  target_url =
    "https://www.carousell.sg/categories/cameras-1863/?cameras_type=TYPE_POINT_AND_SHOOT%2CTYPE_DSLR%2CTYPE_MIRRORLESS&searchId=kkZNPc&canChangeKeyword=false&price_end=250&includeSuggestions=false&sort_by=3";

  const params = {
    TableName: process.env.TABLE_ARN,
    Item: {
      channel_id: { S: channel_id },
      target_url: { S: target_url },
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
      return { content: "Bot failed to Start :(" };
    });

  return await putPromise;
};
exports.handler = (event) => {
  globalHandler(event, action);
};
