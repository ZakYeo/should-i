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
const LATITUDE_MINIMUM = -90;
const LATITUDE_MAXIMUM = 90;
const LONGITUDE_MINIMUM = -180;
const LONGITUDE_MAXIMUM = 180;


export async function handler(event) {
  const { userName, commentDescription, latitude, longitude } = JSON.parse(event.body);
  console.log(JSON.stringify(event))
  console.log(`Saving comment to DB using parameters: `, userName, commentDescription, latitude, longitude)

  if (!userName || userName.trim() === '') {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Username cannot be empty or null' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  if (!commentDescription || commentDescription.trim() === '') {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Comment description cannot be empty or null' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }


  if (!latitude || !longitude) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing latitude or longitude parameter' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  let parsedLatitude = parseFloat(latitude);
  let parsedLongitude = parseFloat(longitude);
  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Latitude and longitude must be valid numbers' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  parsedLatitude = Number(latitude.toFixed(6));
  parsedLongitude = Number(longitude.toFixed(6));

  if (parsedLatitude < LATITUDE_MINIMUM || parsedLatitude > LATITUDE_MAXIMUM ||
    parsedLongitude < LONGITUDE_MINIMUM || parsedLongitude > LONGITUDE_MAXIMUM) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Latitude must be between -90 and 90, and longitude must be between -180 and 180' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  const commentId = Date.now().toString();

  const geoHash = geohash.encode(latitude, longitude, precision);

  const putParams = {
    TableName: 'Comments',
    Item: {
      CommentId: commentId,
      UserName: userName,
      Description: commentDescription,
      ThumbsUp: 0,
      ThumbsDown: 0,
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
