const axios = require('axios');
const fs = require('fs');
const breeds = ["Auburn", "Beltsville Small White", "Black", "Bourbon Red", "Bronze", "Jersey Buff", "Narragansett", "Royal Palm", "Slate", "White Holland"];

const numRequests = 50000;
const numParallelRequests = 5000;
const endpoints = [
  
]

async function runRequests() {
  const endpointResults = [];
  for (const endpoint of endpoints) {
    const statusCodes = {};
    const results = await runParallelRequests(endpoint);
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
    endpointResults.push({
      endpoint,
      stats: {
        p99: p99Duration,
        averageDuration,
        fastestDuration,
        statusCodes
      }
    });
  }

  const results = {
    numberOfRequests: numRequests,
    parallelExecutions: numParallelRequests,
    data: endpointResults
  };
  fs.writeFileSync(`results-${new Date().toISOString().split('.')[0].replace(/:/g, '.')}.json`, JSON.stringify(results, null, 2));
}

async function runParallelRequests(endpoint) {
  const batches = [];
  const totalRequests = new Array(numRequests).fill(endpoint);
  batchSize = Math.ceil(numRequests / numParallelRequests);
  while (totalRequests.length) {
    const batch = totalRequests.splice(0, batchSize);
    for (let i = 0; i < batch.length; i++) {
      const randomIndex = Math.floor(Math.random() * breeds.length);
      const breed = breeds[randomIndex];
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
      if (error.response) {
        statuses.push(error.response.status);
      } else if (error.status) {
        statuses.push(error.response.status);
      }
      console.error(`${error.response?.status} - ${error.response?.statusText}`);
    }
  }

  return { statuses, executionTimes };
};

runRequests();
