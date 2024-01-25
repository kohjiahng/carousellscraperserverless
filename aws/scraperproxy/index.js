const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const lambda = new AWS.Lambda({ apiVersion: "2015-03-31" });

async function callScraper(item) {
  const params = {
    FunctionName: process.env.ID_SCRAPER_ARN,
    InvokeArgs: JSON.stringify(item),
  };
  invokePromise = new Promise((resolve, reject) => {
    lambda.invokeAsync(params, (err, data) => {
      if (data) {
        resolve(data);
      } else {
        console.log(err);
        reject(err);
      }
    });
  });

  return invokePromise;
}
exports.handler = async (event) => {
  scanResult = await new Promise((resolve, reject) => {
    dynamodb.scan({ TableName: process.env.REQUEST_TABLE_ARN }, (err, data) => {
      if (data) {
        resolve(data);
      } else {
        console.log(err);
        reject(err);
      }
    });
  });

  invokePromises = scanResult.Items.map(callScraper);

  await Promise.allSettled(invokePromises);
};
