/**
 * A Lambda function that returns a static string
 */
export const handler = async () => {
  // If you change this message, you will need to change hello-from-lambda.test.mjs
  const message = 'Hello from Lambda!';

  // All log statements are written to CloudWatch
  console.info(`${message}`);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Everything is working correctly!"
    })
  };
}
