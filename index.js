import express from 'express';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
const ddb = new DynamoDBClient();

const app = express();
app.use(express.json());

app.listen(8000, () => { console.log('Listening on port 8000') });

app.get('/turkeys/:breed', async (req, res) => {
  try {
    const data = await ddb.send(new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: 'breed',
      KeyConditionExpression: '#breed = :breed',
      ExpressionAttributeNames: {
        '#breed': 'breed'
      },
      ExpressionAttributeValues: marshall({
        ':breed': req.params.breed
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

    return res.status(200).send(turkeys);
  } catch (err) {
    console.error({ endpoint: `GET /turkeys/${req.params.breed}`, error: err });
    return res.status(500).send({ message: 'Something went wrong' });
  }
});