import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import geohash from 'ngeohash';


const isLocal = true;
// command sam local start-api starts aws resources in a docker container, so use this endpoint
// So lambda knows to point to localhost of the machine, as localhost:8000 will point to localhost of the docker
const localEndpoint = "http://host.docker.internal:8000";

const client = new DynamoDBClient({
  region: 'eu-west-2', endpoint: isLocal ? localEndpoint : undefined
});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const precision = 6;


export async function handler(event) {
  const { userName, commentDescription, thumbsUpAmount, thumbsDownAmount, latitude, longitude } = event.body;
  console.log(JSON.stringify(event))
  console.log(`Saving comment to DB using parameters: `, userName, commentDescription, thumbsUpAmount, thumbsDownAmount, latitude, longitude)

  const commentId = Date.now().toString();

  const geoHash = geohash.encode(latitude, longitude, precision);

  const putParams = {
    TableName: 'Comments',
    Item: {
      CommentId: commentId,
      UserName: userName,
      Description: commentDescription,
      ThumbsUp: thumbsUpAmount,
      ThumbsDown: thumbsDownAmount,
      Latitude: latitude,
      Longitude: longitude,
      Geohash: geoHash
    }
  };

  try {
    await ddbDocClient.send(new PutCommand(putParams));
    return { statusCode: 200, body: JSON.stringify({ message: 'Comment added successfully!', commentId }) };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to add comment', errorMessage: error.message }) };
  }
}
