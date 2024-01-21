# Assumes lambda is already deployed

cd lambda
AWS_ACCESS_KEY_ID=$(serverless output get --name ProxyLambdaInvokerAccessKeyID)
AWS_SECRET_ACCESS_KEY=$(serverless output get --name ProxyLambdaInvokerSecretAccessKey)
LAMBDA_FN=$(serverless output get --name ProxyLambdaArn)


cd ../workers/carouselldiscordscraperapi

yarn wrangler deploy

echo $AWS_ACCESS_KEY_ID | yarn wrangler secret put AWS_ACCESS_KEY_ID 
echo $AWS_SECRET_ACCESS_KEY | yarn wrangler secret put AWS_SECRET_ACCESS_KEY
echo $LAMBDA_FN | yarn wrangler secret put LAMBDA_FN 

