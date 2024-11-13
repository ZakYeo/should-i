import { Construct } from "constructs";
import * as aws from "@cdktf/provider-aws";

import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { DynamodbTable } from "@cdktf/provider-aws/lib/dynamodb-table";
import { App, TerraformStack, AssetType, TerraformAsset, TerraformOutput } from "cdktf";
import * as path from 'path';
import * as glob from 'glob';
import * as mime from 'mime-types';

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
      //profile: "zak-personal"
    });

    new DynamodbTable(this, "CommentsTable", {
      name: 'Comments',
      hashKey: 'CommentId',
      billingMode: 'PAY_PER_REQUEST',
      attribute: [
        { name: 'CommentId', type: 'S' },
        { name: 'Geohash', type: 'S' }
      ],
      globalSecondaryIndex: [{
        name: "GeohashIndex",
        hashKey: 'Geohash',
        projectionType: 'ALL'
      }]
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

    // Bucket to serve frontend
    const reactAppBucket = new aws.s3Bucket.S3Bucket(this, "react-app-bucket", {
      bucket: "zak-should-i",
    });

    const originAccessIdentity = new aws.cloudfrontOriginAccessIdentity.CloudfrontOriginAccessIdentity(this, "OriginAccessIdentity", {
      comment: "OAI for zak-should-i bucket",
    });

    // Step 2: Create CloudFront distribution for the S3 bucket with OAI
    const cloudFrontDistribution = new aws.cloudfrontDistribution.CloudfrontDistribution(this, "CloudFrontDistribution", {
      origin: [{
        domainName: `${reactAppBucket.bucketRegionalDomainName}`,
        originId: "s3-origin",
        s3OriginConfig: {
          originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath // Link OAI to the distribution
        }
      }],
      enabled: true,
      defaultCacheBehavior: {
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        targetOriginId: "s3-origin",
        viewerProtocolPolicy: "redirect-to-https", // Forces HTTPS
        forwardedValues: {
          queryString: false,
          cookies: { forward: "none" }
        }
      },
      viewerCertificate: {
        cloudfrontDefaultCertificate: true // Use default CloudFront certificate
      },
      restrictions: {
        geoRestriction: { restrictionType: "none" }
      },
      customErrorResponse: [
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: "/index.html"
        },
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: "/index.html"
        }
      ]
    });

    // Set ownership controls
    new aws.s3BucketOwnershipControls.S3BucketOwnershipControls(this, "react-app-bucket-ownership", {
      bucket: reactAppBucket.bucket,
      rule: {
        objectOwnership: "BucketOwnerEnforced"
      }
    });


    new aws.s3BucketPolicy.S3BucketPolicy(this, "react-app-bucket-policy", {
      bucket: reactAppBucket.bucket,
      policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "AllowCloudFrontAccess",
            Effect: "Allow",
            Principal: {
              "CanonicalUser": originAccessIdentity.s3CanonicalUserId
            },
            Action: "s3:GetObject",
            Resource: `arn:aws:s3:::${reactAppBucket.bucket}/*`
          }
        ]
      })
    });

    // Output the CloudFront URL
    new TerraformOutput(this, "cloudfront_url", {
      value: cloudFrontDistribution.domainName,
      description: "HTTPS URL for the React app served from CloudFront"
    });

    // Path to the build directory
    const buildDir: string = path.resolve(__dirname, "../frontend/build");

    // Use glob to find all files recursively, including subdirectories
    const files: string[] = glob.sync("**/*", { cwd: buildDir, nodir: true });

    // Upload each file, maintaining the relative path as the S3 key
    files.forEach((file: string) => {
      const filePath = path.join(buildDir, file);
      const contentType = mime.lookup(file) || 'application/octet-stream';

      new aws.s3Object.S3Object(this, `react-app-file-${file.replace(/\//g, '-')}`, {
        bucket: reactAppBucket.bucket,
        key: file, // Use relative path as the S3 key to maintain folder structure
        source: filePath,
        contentType: contentType,
        acl: undefined
      });
    });

    // Output the S3 Website URL
    new TerraformOutput(this, "bucket_website_url", {
      value: reactAppBucket.websiteEndpoint,
      description: "Public URL for the S3 bucket to access the React app"
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
    const saveCommentLambda = new aws.lambdaFunction.LambdaFunction(
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
    const getNearbyCommentsLambda = new aws.lambdaFunction.LambdaFunction(
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
    const checkCoatLambda = new aws.lambdaFunction.LambdaFunction(
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
    const addThumbUpOrDownLambda = new aws.lambdaFunction.LambdaFunction(
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


    // Create and configure API gateway
    const api = new aws.apiGatewayRestApi.ApiGatewayRestApi(
      this,
      "zak-api-gateway",
      {
        name: `zak-api-gateway`,
        endpointConfiguration: {
          types: ["REGIONAL"],
        },
      }
    );

    // /comment
    const commentResource = new aws.apiGatewayResource.ApiGatewayResource(
      this,
      "CommentResource",
      {
        restApiId: api.id,
        parentId: api.rootResourceId,
        pathPart: "comment",
      }
    );


    // /comment/save
    const commentSaveResource = new aws.apiGatewayResource.ApiGatewayResource(
      this,
      "CommentSaveResource",
      {
        restApiId: api.id,
        parentId: commentResource.id,
        pathPart: "save",
      }
    );

    new aws.lambdaPermission.LambdaPermission(this, "apigw-lambda-save-comment", {
      functionName: saveCommentLambda.functionName,
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
      sourceArn: `${api.executionArn}/*/*`
    });

    const commentSaveOptionsMethod = new aws.apiGatewayMethod.ApiGatewayMethod(
      this,
      `CommentSaveMethodOPTIONS`,
      {
        restApiId: api.id,
        resourceId: commentSaveResource.id,
        httpMethod: "OPTIONS",
        authorization: "NONE",
      }
    );

    const commentSaveOptionsIntegration = new aws.apiGatewayIntegration.ApiGatewayIntegration(
      this,
      "CommentSaveMockIntegrationOptions",
      {
        restApiId: api.id,
        resourceId: commentSaveResource.id,
        httpMethod: commentSaveOptionsMethod.httpMethod,
        type: "MOCK",
        requestTemplates: {
          "application/json": '{"statusCode": 200}',
        },
      }
    );
    const commentSaveMethodResponse = new aws.apiGatewayMethodResponse.ApiGatewayMethodResponse(
      this,
      "CommentSaveMethodResponse",
      {
        restApiId: api.id,
        resourceId: commentSaveResource.id,
        httpMethod: commentSaveOptionsIntegration.httpMethod,
        statusCode: "200",
        responseModels: {
          "application/json": "Empty",
        },
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Headers": true,
        },
      }
    );

    new aws.apiGatewayIntegrationResponse.ApiGatewayIntegrationResponse(
      this,
      "CommentSaveMockIntegrationResponseOptions",
      {
        restApiId: api.id,
        resourceId: commentSaveResource.id,
        httpMethod: commentSaveMethodResponse.httpMethod,
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": "'*'",
          "method.response.header.Access-Control-Allow-Methods":
            "'OPTIONS,POST'",
        },
      }
    );

    const commentSavePostMethod = new aws.apiGatewayMethod.ApiGatewayMethod(
      this,
      `CommentSaveMethodPost`,
      {
        restApiId: api.id,
        resourceId: commentSaveResource.id,
        httpMethod: "POST",
        authorization: "NONE",
        authorizerId: "",
      }
    );

    const commentSavePostIntegration = new aws.apiGatewayIntegration.ApiGatewayIntegration(
      this,
      "CommentSaveIntegrationPost",
      {
        restApiId: api.id,
        resourceId: commentSaveResource.id,
        httpMethod: commentSavePostMethod.httpMethod,
        type: "AWS_PROXY",
        integrationHttpMethod: "POST",
        uri: saveCommentLambda.invokeArn,
      }
    );

    new aws.apiGatewayMethodResponse.ApiGatewayMethodResponse(
      this,
      "CommentSaveMethodResponsePost",
      {
        restApiId: api.id,
        resourceId: commentSaveResource.id,
        httpMethod: commentSavePostIntegration.httpMethod,
        statusCode: "200",
        responseModels: {
          "application/json": "Empty",
        },
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      }
    );


    // /comment/rate
    const commentRateResource = new aws.apiGatewayResource.ApiGatewayResource(
      this,
      "CommentRateResource",
      {
        restApiId: api.id,
        parentId: commentResource.id,
        pathPart: "rate",
      }
    );

    new aws.lambdaPermission.LambdaPermission(this, "apigw-lambda-add-thumb-up-or-down", {
      functionName: addThumbUpOrDownLambda.functionName,
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
      sourceArn: `${api.executionArn}/*/*`
    });

    const commentRateOptionsMethod = new aws.apiGatewayMethod.ApiGatewayMethod(
      this,
      `CommentRateMethodOPTIONS`,
      {
        restApiId: api.id,
        resourceId: commentRateResource.id,
        httpMethod: "OPTIONS",
        authorization: "NONE",
      }
    );

    const commentRateOptionsIntegration = new aws.apiGatewayIntegration.ApiGatewayIntegration(
      this,
      "CommentRateMockIntegrationOptions",
      {
        restApiId: api.id,
        resourceId: commentRateResource.id,
        httpMethod: commentRateOptionsMethod.httpMethod,
        type: "MOCK",
        requestTemplates: {
          "application/json": '{"statusCode": 200}',
        },
      }
    );
    const commentRateMethodResponse = new aws.apiGatewayMethodResponse.ApiGatewayMethodResponse(
      this,
      "CommentRateMethodResponse",
      {
        restApiId: api.id,
        resourceId: commentRateResource.id,
        httpMethod: commentRateOptionsIntegration.httpMethod,
        statusCode: "200",
        responseModels: {
          "application/json": "Empty",
        },
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Headers": true,
        },
      }
    );

    new aws.apiGatewayIntegrationResponse.ApiGatewayIntegrationResponse(
      this,
      "CommentRateMockIntegrationResponseOptions",
      {
        restApiId: api.id,
        resourceId: commentRateResource.id,
        httpMethod: commentRateMethodResponse.httpMethod,
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": "'*'",
          "method.response.header.Access-Control-Allow-Methods":
            "'OPTIONS,POST'",
        },
      }
    );

    const commentRatePostMethod = new aws.apiGatewayMethod.ApiGatewayMethod(
      this,
      `CommentRateMethodPost`,
      {
        restApiId: api.id,
        resourceId: commentRateResource.id,
        httpMethod: "POST",
        authorization: "NONE",
        authorizerId: "",
      }
    );

    const commentRatePostIntegration = new aws.apiGatewayIntegration.ApiGatewayIntegration(
      this,
      "CommentRateIntegrationPost",
      {
        restApiId: api.id,
        resourceId: commentRateResource.id,
        httpMethod: commentRatePostMethod.httpMethod,
        type: "AWS_PROXY",
        integrationHttpMethod: "POST",
        uri: addThumbUpOrDownLambda.invokeArn,
      }
    );

    new aws.apiGatewayMethodResponse.ApiGatewayMethodResponse(
      this,
      "CommentRateMethodResponsePost",
      {
        restApiId: api.id,
        resourceId: commentRateResource.id,
        httpMethod: commentRatePostIntegration.httpMethod,
        statusCode: "200",
        responseModels: {
          "application/json": "Empty",
        },
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      }
    );

    // /comment/get
    const commentGetResource = new aws.apiGatewayResource.ApiGatewayResource(
      this,
      "CommentGetResource",
      {
        restApiId: api.id,
        parentId: commentResource.id,
        pathPart: "get",
      }
    );
    // /comment/get/nearby
    const commentGetNearbyResource = new aws.apiGatewayResource.ApiGatewayResource(
      this,
      "CommentGetNearbyResource",
      {
        restApiId: api.id,
        parentId: commentGetResource.id,
        pathPart: "nearby",
      }
    );

    new aws.lambdaPermission.LambdaPermission(this, "apigw-lambda-get-nearby-comments", {
      functionName: getNearbyCommentsLambda.functionName,
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
      sourceArn: `${api.executionArn}/*/*`
    });

    const commentGetNearbyOptionsMethod = new aws.apiGatewayMethod.ApiGatewayMethod(
      this,
      `CommentsGetNearbyMethodOPTIONS`,
      {
        restApiId: api.id,
        resourceId: commentGetNearbyResource.id,
        httpMethod: "OPTIONS",
        authorization: "NONE",
      }
    );

    const getNearbyCommentsOptionsIntegration = new aws.apiGatewayIntegration.ApiGatewayIntegration(
      this,
      "GetNearbyCommentsMockIntegrationOptions",
      {
        restApiId: api.id,
        resourceId: commentGetNearbyResource.id,
        httpMethod: commentGetNearbyOptionsMethod.httpMethod,
        type: "MOCK",
        requestTemplates: {
          "application/json": '{"statusCode": 200}',
        },
      }
    );
    const getNearbyCommentsMethodResponse = new aws.apiGatewayMethodResponse.ApiGatewayMethodResponse(
      this,
      "GetNearbyCommentsMethodResponse",
      {
        restApiId: api.id,
        resourceId: commentGetNearbyResource.id,
        httpMethod: getNearbyCommentsOptionsIntegration.httpMethod,
        statusCode: "200",
        responseModels: {
          "application/json": "Empty",
        },
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Headers": true,
        },
      }
    );

    new aws.apiGatewayIntegrationResponse.ApiGatewayIntegrationResponse(
      this,
      "GetNearbyCommentsMockIntegrationResponseOptions",
      {
        restApiId: api.id,
        resourceId: commentGetNearbyResource.id,
        httpMethod: getNearbyCommentsMethodResponse.httpMethod,
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": "'*'",
          "method.response.header.Access-Control-Allow-Methods":
            "'OPTIONS,GET'",
        },
      }
    );

    const getNearbyCommentsGetMethod = new aws.apiGatewayMethod.ApiGatewayMethod(
      this,
      `GetNearbyCommentsMethodPost`,
      {
        restApiId: api.id,
        resourceId: commentGetNearbyResource.id,
        httpMethod: "GET",
        authorization: "NONE",
        authorizerId: "",
      }
    );

    const getNearbyCommentsGetIntegration = new aws.apiGatewayIntegration.ApiGatewayIntegration(
      this,
      "GetNearbyCommentsIntegrationPost",
      {
        restApiId: api.id,
        resourceId: commentGetNearbyResource.id,
        httpMethod: getNearbyCommentsGetMethod.httpMethod,
        type: "AWS_PROXY",
        integrationHttpMethod: "GET",
        uri: checkCoatLambda.invokeArn,
      }
    );

    new aws.apiGatewayMethodResponse.ApiGatewayMethodResponse(
      this,
      "GetNearbyCommentsMethodResponsePost",
      {
        restApiId: api.id,
        resourceId: commentGetNearbyResource.id,
        httpMethod: getNearbyCommentsGetIntegration.httpMethod,
        statusCode: "200",
        responseModels: {
          "application/json": "Empty",
        },
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      }
    );



    // /check-coat
    const checkCoatResource = new aws.apiGatewayResource.ApiGatewayResource(
      this,
      "CheckCoatResource",
      {
        restApiId: api.id,
        parentId: api.rootResourceId,
        pathPart: "check-coat",
      }
    );

    new aws.lambdaPermission.LambdaPermission(this, "apigw-lambda-check-coat", {
      functionName: checkCoatLambda.functionName,
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
      sourceArn: `${api.executionArn}/*/*`
    });

    const checkCoatOptionsMethod = new aws.apiGatewayMethod.ApiGatewayMethod(
      this,
      `CheckCoatMethodOPTIONS`,
      {
        restApiId: api.id,
        resourceId: checkCoatResource.id,
        httpMethod: "OPTIONS",
        authorization: "NONE",
      }
    );

    const checkCoatOptionsIntegration = new aws.apiGatewayIntegration.ApiGatewayIntegration(
      this,
      "CheckCoatMockIntegrationOptions",
      {
        restApiId: api.id,
        resourceId: checkCoatResource.id,
        httpMethod: checkCoatOptionsMethod.httpMethod,
        type: "MOCK",
        requestTemplates: {
          "application/json": '{"statusCode": 200}',
        },
      }
    );
    const checkCoatMethodResponse = new aws.apiGatewayMethodResponse.ApiGatewayMethodResponse(
      this,
      "CheckCoatMethodResponse",
      {
        restApiId: api.id,
        resourceId: checkCoatResource.id,
        httpMethod: checkCoatOptionsIntegration.httpMethod,
        statusCode: "200",
        responseModels: {
          "application/json": "Empty",
        },
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Headers": true,
        },
      }
    );

    new aws.apiGatewayIntegrationResponse.ApiGatewayIntegrationResponse(
      this,
      "CheckCoatMockIntegrationResponseOptions",
      {
        restApiId: api.id,
        resourceId: checkCoatResource.id,
        httpMethod: checkCoatMethodResponse.httpMethod,
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": "'*'",
          "method.response.header.Access-Control-Allow-Methods":
            "'OPTIONS,GET'",
        },
      }
    );

    const checkCoatGetMethod = new aws.apiGatewayMethod.ApiGatewayMethod(
      this,
      `CheckCoatMethodPost`,
      {
        restApiId: api.id,
        resourceId: checkCoatResource.id,
        httpMethod: "GET",
        authorization: "NONE",
        authorizerId: "",
      }
    );

    const checkCoatGetIntegration = new aws.apiGatewayIntegration.ApiGatewayIntegration(
      this,
      "CheckCoatIntegrationPost",
      {
        restApiId: api.id,
        resourceId: checkCoatResource.id,
        httpMethod: checkCoatGetMethod.httpMethod,
        type: "AWS_PROXY",
        integrationHttpMethod: "GET",
        uri: checkCoatLambda.invokeArn,
      }
    );

    new aws.apiGatewayMethodResponse.ApiGatewayMethodResponse(
      this,
      "CheckCoatMethodResponsePost",
      {
        restApiId: api.id,
        resourceId: checkCoatResource.id,
        httpMethod: checkCoatGetIntegration.httpMethod,
        statusCode: "200",
        responseModels: {
          "application/json": "Empty",
        },
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      }
    );
  }
}

const app = new App();
new MyStack(app, "terraform");
app.synth();
