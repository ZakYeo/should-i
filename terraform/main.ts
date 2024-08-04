import { Construct } from "constructs";
import * as aws from "@cdktf/provider-aws";

import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { App, TerraformStack, AssetType, TerraformAsset } from "cdktf";


const lambdaRolePolicy = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
};

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "AWS", {
      region: "eu-west-2",
    });
    // Create lambda executable
    const assetSaveCommentToDB = new TerraformAsset(this, "lambda-asset-save-comment-to-db", {
      path: '../backend/lambda-functions/save-comment-to-db/',
      type: AssetType.ARCHIVE,
    });
    const assetGetNearbyComments = new TerraformAsset(this, "lambda-asset-get-nearby-comments", {
      path: '../backend/lambda-functions/get-nearby-comments/',
      type: AssetType.ARCHIVE,
    });
    const assetCheckCoat = new TerraformAsset(this, "lambda-asset-check-coat", {
      path: '../backend/lambda-functions/check-coat/',
      type: AssetType.ARCHIVE,
    });
    const assetAddThumbUpOrThumbDown = new TerraformAsset(this, "lambda-asset-add-thumb-up-or-down", {
      path: '../backend/lambda-functions/add-thumb-up-or-down/',
      type: AssetType.ARCHIVE,
    });

    // Create bucket to store lambdas
    const lambdaBucket = new aws.s3Bucket.S3Bucket(this, `lambda-bucket`, {
      bucket: `zak-lambda-bucket`,
      tags: {},
    });

    // Upload lambda zip file to lambda store on s3
    new aws.s3Object.S3Object(this, "lambda-archive-save-comment-to-db", {
      bucket: lambdaBucket.bucket,
      key: `save-comment-to-db/${assetSaveCommentToDB.fileName}`,
      source: assetSaveCommentToDB.path,
    });
    new aws.s3Object.S3Object(this, "lambda-archive-get-nearby-comments", {
      bucket: lambdaBucket.bucket,
      key: `get-nearby-comments/${assetGetNearbyComments.fileName}`,
      source: assetGetNearbyComments.path,
    });
    new aws.s3Object.S3Object(this, "lambda-archive-check-coat", {
      bucket: lambdaBucket.bucket,
      key: `check-coat/${assetCheckCoat.fileName}`,
      source: assetCheckCoat.path,
    });
    new aws.s3Object.S3Object(this, "lambda-archive-add-thumb-up-or-down", {
      bucket: lambdaBucket.bucket,
      key: `add-thumb-up-or-down/${assetAddThumbUpOrThumbDown.fileName}`,
      source: assetAddThumbUpOrThumbDown.path,
    });

    // Create Lambda role
    const role = new aws.iamRole.IamRole(this, "lambda-exec", {
      name: `basic-lambda-role`,
      assumeRolePolicy: JSON.stringify(lambdaRolePolicy)
    });

    // Add execution role for lambda to write to CloudWatch logs
    new aws.iamRolePolicyAttachment.IamRolePolicyAttachment(this, "lambda-managed-policy", {
      policyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
      role: role.name
    });

    // Create and deploy lambda resource with code
    new aws.lambdaFunction.LambdaFunction(
      this,
      `lambda-save-comment-to-db`,
      {
        functionName: `save-comment-to-db`,
        s3Bucket: lambdaBucket.bucket,
        s3Key: `save-comment-to-db/${assetSaveCommentToDB.fileName}`,
        handler: `src/handlers/save-comment-to-db.handler`,
        runtime: `nodejs18.x`,
        role: role.arn
      }
    );
    new aws.lambdaFunction.LambdaFunction(
      this,
      `lambda-get-nearby-comments`,
      {
        functionName: `get-nearby-comments`,
        s3Bucket: lambdaBucket.bucket,
        s3Key: `get-nearby-comments/${assetGetNearbyComments.fileName}`,
        handler: `src/handlers/get-nearby-comments.handler`,
        runtime: `nodejs18.x`,
        role: role.arn
      }
    );
    new aws.lambdaFunction.LambdaFunction(
      this,
      `lambda-check-coat`,
      {
        functionName: `check-coat`,
        s3Bucket: lambdaBucket.bucket,
        s3Key: `check-coat/${assetCheckCoat.fileName}`,
        handler: `src/handlers/check-coat.handler`,
        runtime: `nodejs18.x`,
        role: role.arn
      }
    );
    new aws.lambdaFunction.LambdaFunction(
      this,
      `lambda-add-thumb-up-or-down`,
      {
        functionName: `add-thumb-up-or-down`,
        s3Bucket: lambdaBucket.bucket,
        s3Key: `add-thumb-up-or-down/${assetAddThumbUpOrThumbDown.fileName}`,
        handler: `src/handlers/add-thumb-up-or-down.handler`,
        runtime: `nodejs18.x`,
        role: role.arn
      }
    );
  }
}

const app = new App();
new MyStack(app, "terraform");
app.synth();
