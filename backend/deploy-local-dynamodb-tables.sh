#!/bin/bash
# Create the necessary dynamoDB tables locally
aws dynamodb create-table \
    --table-name Comments \
    --attribute-definitions AttributeName=CommentId,AttributeType=S AttributeName=Geohash,AttributeType=S \
    --key-schema AttributeName=CommentId,KeyType=HASH \
    --global-secondary-indexes "IndexName=GeohashIndex,KeySchema=[{AttributeName=Geohash,KeyType=HASH}],Projection={ProjectionType=ALL}" \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:8000
