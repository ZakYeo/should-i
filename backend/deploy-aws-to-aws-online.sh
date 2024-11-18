#!/bin/bash
set -e

STACK_NAME="should-i-stack"
REGION="eu-west-2"
BUCKET_NAME="should-i-sam-artifacts"
# Check if the stack exists, if it does, delete it for a fresh slate
if aws cloudformation describe-stacks --stack-name $STACK_NAME >/dev/null 2>&1; then
    echo "Stack $STACK_NAME exists. Deleting..."
    aws s3 rm s3://should-i-web-app --recursive
    sam delete --stack-name $STACK_NAME --region $REGION --no-prompts
else
    echo "Stack $STACK_NAME does not exist. Skipping deletion."
fi

# Create a bucket to store artifacts
aws s3 ls | grep $BUCKET_NAME || aws s3 mb s3://$BUCKET_NAME

# Now deploy using SAM
sam package --template-file template.yaml --s3-bucket $BUCKET_NAME --output-template-file packaged-template.yaml
sam deploy --template-file packaged-template.yaml --stack-name $STACK_NAME --guided



# Grab the API ID to dynamically construct the API url for the frontend to query during localstack
API_ID=$(aws apigateway get-rest-apis --query "items[?contains(name, '$STACK_NAME')].id" --output text)


if [ -z "$API_ID" ]; then
    echo "API ID not found, aborting deployment."
    exit 1
fi

# Now build & upload frontend to bucket created
cd ../frontend/ || exit
#export REACT_APP_BASE_URL="http://localhost:4566/_aws/execute-api/$API_ID/prod"
npm run build
aws s3 cp ./build s3://should-i-web-app --recursive
