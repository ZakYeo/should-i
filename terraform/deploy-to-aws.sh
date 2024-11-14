#!/bin/bash

FRONTEND_DIRPATH=../frontend/
BUILD_DIRPATH=/build/
BUCKET_NAME=zak-should-i

# First deploy our AWS infrastructure
cdktf deploy

# Now build our frontend code ready for AWS
cd "$FRONTEND_DIRPATH" || exit
npm run build

# Now upload our frontend to a publicly served bucket built from Terraform
aws s3 cp "$FRONTEND_DIRPATH$BUILD_DIRPATH" s3://"$BUCKET_NAME"/ --recursive
