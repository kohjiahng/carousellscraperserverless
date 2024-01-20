const nacl = require('tweetnacl');
const { Lambda } = require('aws-sdk');

const lambda = new Lambda();

async function verifyEvent(event) {
  const PUBLIC_KEY = process.env.PUBLIC_KEY;
  const signature = event.headers['x-signature-ed25519']
  const timestamp = event.headers['x-signature-timestamp'];
  const strBody = event.body; // should be string, for successful sign

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + strBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );
  return isVerified;
}
exports.handler = async (event) => {
  // Checking signature (requirement 1.)
  // Your public key can be found on your application in the Developer Portal
  

  console.log(event)

  verifyPromise = verifyEvent(event);

  // Replying to ping (requirement 2.)
  const body = JSON.parse(event.body)
  if (body.type == 1) {
    if (await verifyPromise){
      return { "type" : 1 }
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify('invalid request signature'),
      };
    }
    
  }

  if (body.data.name) {
    const lambdaPromise = lambda.invoke({
      FunctionName: process.env.PROXY_LAMBDA_ARN,
      Payload: JSON.stringify(event),
      InvocationType: 'Event',
    }).promise();

    if (await Promise.all([verifyPromise, lambdaPromise])) {
      return JSON.stringify({
        "type": 4,
        "data": { "content": "*⏳ Loading...*" }
      })
    }
  }
  return {
    statusCode: 404,
  }

}