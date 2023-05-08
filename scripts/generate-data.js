const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { faker } = require('@faker-js/faker');
const fs = require('fs');

const ddb = new DynamoDBClient();
const breeds = ["Auburn", "Beltsville Small White", "Black", "Bourbon Red", "Bronze", "Jersey Buff", "Narragansett", "Royal Palm", "Slate", "White Holland"];
const tableName = 'latency-LatencyTable-118MMVYBORTD';
const numTurkeys = 1000;

async function run() {
  const turkeyIds = [];

  for (let i = 0; i < numTurkeys; i++) {
    const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
    const randomWeightInOunces = Math.floor(Math.floor(Math.random() * 19 + 192) * 0.0625);
    const randomWeightInPounds = Math.floor(Math.random() * 20 + 12);
    const randomWeight = `${randomWeightInPounds} pounds ${randomWeightInOunces} oz`;
    const randomName = faker.name.firstName();
    const randomId = Math.random().toString(36).substr(2, 5);
    const turkey = {
      id: randomId,
      name: randomName,
      breed: randomBreed,
      weight: randomWeight
    };
    turkeyIds.push(randomId);

    try {
      await ddb.send(new PutItemCommand({
        TableName: tableName,
        Item: marshall({
          'pk': turkey.id,
          'sk': turkey.name,
          'breed': turkey.breed,
          'weight': turkey.weight,
          'name': turkey.name
        })
      }));
    } catch (err) {
      console.error(err);
    }
  }

  fs.writeFileSync('ids.json', JSON.stringify(turkeyIds, null, 2));
}

run();
