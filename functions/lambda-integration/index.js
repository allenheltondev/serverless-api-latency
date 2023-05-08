const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');

const ddb = new DynamoDBClient();

exports.handler = async (event) => {
  try {
    const data = await ddb.send(new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: 'breed',
      KeyConditionExpression: '#breed = :breed',
      ExpressionAttributeNames: {
        '#breed': 'breed'
      },
      ExpressionAttributeValues: marshall({
        ':breed': event.pathParameters.breed
      })
    }));

    let turkeys = [];
    if (data.Count) {
      turkeys = data.Items.map(item => {
        const turkey = unmarshall(item);
        turkey.id = turkey.pk;
        delete turkey.pk;

        return turkey;
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(turkeys)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Something went wrong' })
    };
  }
};