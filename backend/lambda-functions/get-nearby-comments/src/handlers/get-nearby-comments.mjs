import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import geohash from 'ngeohash';

const isLocal = true;
// command sam local start-api starts aws resources in a docker container, so use this endpoint
// So lambda knows to point to localhost of the machine, as localhost:8000 will point to localhost of the docker
const localEndpoint = "http://host.docker.internal:8000";
const LATITUDE_MINIMUM = -90;
const LATITUDE_MAXIMUM = 90;
const LONGITUDE_MINIMUM = -180;
const LONGITUDE_MAXIMUM = 180;

const client = new DynamoDBClient({
  region: 'eu-west-2', endpoint: isLocal ? localEndpoint : undefined
});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const { lat, lon } = event.queryStringParameters;

  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing latitude or longitude parameter' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  let latitude = parseFloat(lat);
  let longitude = parseFloat(lon);
  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Latitude and longitude must be valid numbers' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  latitude = Number(latitude.toFixed(6));
  longitude = Number(longitude.toFixed(6));

  if (latitude < LATITUDE_MINIMUM || latitude > LATITUDE_MAXIMUM ||
    longitude < LONGITUDE_MINIMUM || longitude > LONGITUDE_MAXIMUM) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Latitude must be between -90 and 90, and longitude must be between -180 and 180' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }


  const geoHash = geohash.encode(lat, lon, 6);

  try {
    const queryCommand = new QueryCommand({
      TableName: 'Comments',
      IndexName: 'GeohashIndex',
      KeyConditionExpression: 'Geohash = :gh',
      ExpressionAttributeValues: {
        ':gh': geoHash
      }
    });

    const { Items } = await ddbDocClient.send(queryCommand);


    return {
      statusCode: 200,
      body: JSON.stringify(Items),
      headers: {
        "Content-Type": "application/json"
      }
    };
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to get nearby comments' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
};
