import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const isLocal = true;
// command sam local start-api starts aws resources in a docker container, so use this endpoint
// So lambda knows to point to localhost of the machine, as localhost:8000 will point to localhost of the docker
const localEndpoint = "http://host.docker.internal:8000";

const client = new DynamoDBClient({
  region: 'eu-west-2', endpoint: isLocal ? localEndpoint : undefined
});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function handler(event) {
  const { commentId, voteType } = JSON.parse(event.body);

  const updateParams = {
    TableName: 'Comments',
    Key: { CommentId: commentId },
    UpdateExpression: 'ADD #vote :inc',
    ExpressionAttributeNames: {
      '#vote': voteType === 'up' ? 'ThumbsUp' : 'ThumbsDown',
    },
    ExpressionAttributeValues: {
      ':inc': 1,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const result = await ddbDocClient.send(new UpdateCommand(updateParams));
    return { statusCode: 200, body: JSON.stringify({ message: 'Vote updated successfully!', result }) };
  } catch (error) {
    console.error('Error updating vote:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to update vote', errorMessage: error.message }) };
  }
}
