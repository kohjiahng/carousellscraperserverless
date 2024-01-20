const AWS = require('aws-sdk');

exports.handler = async (event) => {
  body = JSON.parse(event.body)
  var eventText = JSON.stringify(body, null, 2);
  
  var params = {
    Message: eventText,
    Subject: "Test SNS From Lambda",
    TopicArn: process.env.TOPIC_ARN,
    MessageAttributes: { "command": { DataType: 'String', StringValue: body.data.name } }
  };

  // Create promise and SNS service object
  await new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise().then((value)=>{
    console.log('Published to SNS!')
  });

}