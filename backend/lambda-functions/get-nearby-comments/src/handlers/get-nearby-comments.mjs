import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import geohash from 'ngeohash';

const isLocal = true;
// command sam local start-api starts aws resources in a docker container, so use this endpoint
// So lambda knows to point to localhost of the machine, as localhost:8000 will point to localhost of the docker
const localEndpoint = "http://host.docker.internal:8000";

const client = new DynamoDBClient({
  region: 'eu-west-2', endpoint: isLocal ? localEndpoint : undefined
});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const { lat, lon } = event.queryStringParameters;


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
