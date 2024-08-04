import { Construct } from "constructs";
import * as aws from "@cdktf/provider-aws";

import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { App, TerraformStack, AssetType, TerraformAsset } from "cdktf";

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

    /*new aws.lambdaFunction.LambdaFunction(
      scope,
      `lambda-save-comment-to-db`,
      {
        s3Bucket: lambdaBucket.bucket,
        s3Key: 

      }
    );*/
  }
}

const app = new App();
new MyStack(app, "terraform");
app.synth();
