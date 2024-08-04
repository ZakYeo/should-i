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
    const asset = new TerraformAsset(this, "lambda-asset-save-comment-to-db", {
      path: '../backend/lambda-functions/save-comment-to-db/',
      type: AssetType.ARCHIVE, // if left empty it infers directory and file
    });

    // Create bucket to store lambdas
    const lambdaBucket = new aws.s3Bucket.S3Bucket(this, `lambda-bucket`, {
      bucket: `zak-lambda-bucket`,
      tags: {},
    });

    // Upload lambda zip file to lambda store on s3
    new aws.s3Object.S3Object(this, "lambda-archive", {
      bucket: lambdaBucket.bucket,
      key: `save-comment-to-db/${asset.fileName}`,
      source: asset.path,
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
        s3Key: `save-comment-to-db/${asset.fileName}`,
        handler: `src/handlers/save-comment-to-db.handler`,
        runtime: `nodejs18.x`,
        role: role.arn
      }
    );
  }
}

const app = new App();
new MyStack(app, "terraform");
app.synth();
