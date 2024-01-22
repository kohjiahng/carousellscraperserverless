const AWS = require("aws-sdk");
exports.handler = async (event) => {
  var params = {
    Message: event.body,
    TopicArn: process.env.TOPIC_ARN,
    MessageAttributes: {
      command: { DataType: "String", StringValue: body.data.name },
    },
  };

  // Create promise and SNS service object
  snsPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(params)
    .promise()
    .then((value) => {
      console.log("Published to SNS!");
      return { status: 200 };
    })
    .catch((err) => {
      console.log(err);
      return { status: 500 };
    });

  return await snsPromise;
};
