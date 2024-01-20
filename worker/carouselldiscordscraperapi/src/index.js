import { Buffer } from 'node:buffer';
import { AwsClient } from 'aws4fetch'
import nacl from 'tweetnacl';

// Modified from https://github.com/mhart/aws4fetch/tree/master/example

class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init.headers = init.headers || {};
    init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json;charset=UTF-8';
    super(jsonBody, init);
  }
}

async function verifyEvent(event, PUBLIC_KEY) {
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

async function toLambdaEvent(request) {
  const url = new URL(request.url)
  return {
    httpMethod: request.method,
    path: url.pathname,
    queryStringParameters: [...url.searchParams].reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {}),
    headers: [...request.headers].reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {}),
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
  }
}

export default{
  async fetch(request, env, ctx) {
    const aws = new AwsClient({ accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }) // eslint-disable-line no-undef
    const REGION = env.REGION || "ap-southeast-1"
    const LAMBDA_INVOKE_URL = `https://lambda.${REGION}.amazonaws.com/2015-03-31/functions/${env.LAMBDA_FN}/invocations?X-Amz-Invocation-Type=Event`

    const lambdaEvent = await toLambdaEvent(request);
    const requestBody = JSON.parse(lambdaEvent.body)
    console.log(requestBody)

    const verifyPromise = verifyEvent(lambdaEvent, env.PUBLIC_KEY);

    if (requestBody.type == 1) { // Ping
      if (await verifyPromise){ // Pong
        return new JsonResponse(
          {type : 1 },
          { status: 200 }
        )
      } else {
        return new JsonResponse(
          'invalid request signature',
          { status: 401 }
        );
      }
    }
    if (requestBody.data.name) {
      const lambdaPromise = aws.fetch(LAMBDA_INVOKE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lambdaEvent),
      }).then(async value=>console.log(await value.json()))

      if (await Promise.all([verifyPromise, lambdaPromise])) {
        return new JsonResponse(
          { "type": 5 },
          { status: 200 }
        )
      }
    }
    return new JsonResponse({}, {status: 404})
  }
}

