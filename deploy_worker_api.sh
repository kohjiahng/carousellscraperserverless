# Assumes lambda is already deployed

cd aws
AWS_ACCESS_KEY_ID=$(serverless output get --stage $STAGE --name ProxyLambdaInvokerAccessKeyID)
AWS_SECRET_ACCESS_KEY=$(serverless output get --stage $STAGE --name ProxyLambdaInvokerSecretAccessKey)
LAMBDA_FN=$(serverless output get --stage $STAGE --name ProxyLambdaArn)


cd ../workers/carouselldiscordscraperapi

yarn wrangler deploy --env $STAGE

echo $AWS_ACCESS_KEY_ID | yarn wrangler secret put AWS_ACCESS_KEY_ID --env $STAGE
echo $AWS_SECRET_ACCESS_KEY | yarn wrangler secret put AWS_SECRET_ACCESS_KEY --env $STAGE
echo $LAMBDA_FN | yarn wrangler secret put LAMBDA_FN --env $STAGE

