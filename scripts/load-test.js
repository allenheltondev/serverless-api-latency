const axios = require('axios');
const fs = require('fs');
const ids = require('./ids.json');

const numRequests = 100;
const numParallelRequests = 10;
//const endpointUrl = 'https://3b5lnq244b.execute-api.us-east-1.amazonaws.com/dev/direct-integration/turkeys/';
const endpointUrl = 'https://umttgumwsu.us-east-1.awsapprunner.com/turkeys/';

async function runParallelRequests() {
  const batches = [];
  const totalRequests = new Array(numRequests).fill(endpointUrl);
  while (totalRequests.length) {
    const batch = totalRequests.splice(0, numParallelRequests);
    for (let i = 0; i < batch.length; i++) {
      const randomIndex = Math.floor(Math.random() * ids.length);
      const breed = ids[randomIndex];
      batch[i] = `${batch[i]}${breed}`;
    }
    batches.push(batch);
  }

  const results = await Promise.all(batches.map(async (batch) => await runBatch(batch)));
  const statuses = results.map(r => r.statuses).flat(Infinity);
  const executionTimes = results.map(r => r.executionTimes).flat(Infinity);

  return { statuses, executionTimes };
}

async function runBatch(batch) {
  const executionTimes = [];
  const statuses = [];
  for (const request of batch) {
    try {
      const startTime = Date.now();
      const response = await axios.get(request);
      const endTime = Date.now();
      if (response.status === 200) {
        executionTimes.push(endTime - startTime);
      }
      statuses.push(response.status);
    } catch (error) {
      statuses.push(error.response.status);
    }
  }

  return { statuses, executionTimes };
};

// Run the requests in parallel for the specified number of times
async function runRequests() {
  const statusCodes = {};
  const results = await runParallelRequests();
  results.statuses.forEach(statusCode => {
    if (statusCodes[statusCode]) {
      statusCodes[statusCode]++;
    } else {
      statusCodes[statusCode] = 1;
    }
  });

  const successfulExecutionTimes = results.executionTimes.filter(time => time > 0);
  const averageDuration = successfulExecutionTimes.reduce((acc, val) => acc + val, 0) / successfulExecutionTimes.length;
  const p99Duration = successfulExecutionTimes.sort((a, b) => b - a)[Math.floor(successfulExecutionTimes.length * 0.01)];
  const fastestDuration = successfulExecutionTimes.sort((a, b) => a - b)[0];
  const stats = {
    p99: p99Duration,
    averageDuration,
    fastestDuration,
    statusCodes
  };
  fs.writeFileSync('results.json', JSON.stringify({ stats, executionTimes: successfulExecutionTimes }, null, 2));
}

// Call the runRequests function
runRequests();
