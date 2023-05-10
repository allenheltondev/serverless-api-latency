const benchmarkData ={
  "numberOfRequests": 10000,
  "parallelExecutions": 1000,
  "data": [
    {
      "endpoint": "https://3b5lnq244b.execute-api.us-east-1.amazonaws.com/dev/direct-integration/turkeys/",
      "stats": {
        "p99": 3659,
        "averageDuration": 1610.7933,
        "fastestDuration": 113,
        "statusCodes": {
          "200": 10000
        }
      }
    },
    {
      "endpoint": "https://3b5lnq244b.execute-api.us-east-1.amazonaws.com/dev/state-machine/turkeys/",
      "stats": {
        "p99": 1989,
        "averageDuration": 1262.3964,
        "fastestDuration": 100,
        "statusCodes": {
          "200": 10000
        }
      }
    },
    {
      "endpoint": "https://3b5lnq244b.execute-api.us-east-1.amazonaws.com/dev/turkeys/",
      "stats": {
        "p99": 2978,
        "averageDuration": 1239.370774154831,
        "fastestDuration": 115,
        "statusCodes": {
          "200": 9998,
          "500": 2
        }
      }
    },
    {
      "endpoint": "https://umttgumwsu.us-east-1.awsapprunner.com/turkeys/",
      "stats": {
        "p99": 6474,
        "averageDuration": 3602.3349893541517,
        "fastestDuration": 205,
        "statusCodes": {
          "200": 4227,
          "429": 5773
        }
      }
    }
  ]
}

const labels = ['p99', 'Average Duration', 'Fastest Duration', '% Success'];
const lambda = benchmarkData.data.find(d => d.endpoint == 'https://3b5lnq244b.execute-api.us-east-1.amazonaws.com/dev/turkeys/');
const lambdaData = getData(benchmarkData.numberOfRequests, lambda);

const directIntegration = benchmarkData.data.find(d => d.endpoint == 'https://3b5lnq244b.execute-api.us-east-1.amazonaws.com/dev/direct-integration/turkeys/');
const directIntegrationData = getData(benchmarkData.numberOfRequests, directIntegration);

const stateMachine = benchmarkData.data.find(d => d.endpoint == 'https://3b5lnq244b.execute-api.us-east-1.amazonaws.com/dev/state-machine/turkeys/');
const stateMachineData = getData(benchmarkData.numberOfRequests, stateMachine);

const appRunner = benchmarkData.data.find(d => d.endpoint == 'https://umttgumwsu.us-east-1.awsapprunner.com/turkeys/');
const appRunnerData = getData(benchmarkData.numberOfRequests, appRunner);

const chartData = {
  labels: labels,
  datasets: [
    {
      label: 'Lambda',
      data: lambdaData,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    },
    {
      label: 'Direct Integration',
      data: directIntegrationData,
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 1
    },
    {
      label: 'State Machine',
      data: stateMachineData,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    },
    {
      label: 'App Runner',
      data: appRunnerData,
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1
    }
  ]
};

const ctx = document.getElementById('benchmarkChart').getContext('2d');
const benchmarkChart = new Chart(ctx, {
  type: 'bar',
  data: chartData,
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${benchmarkData.numberOfRequests} Total Requests, ${benchmarkData.parallelExecutions} Concurrent`,
        font: {
          size: 20
        }
      }
    }
  }
});

function getData(totalRuns, dataset){
  return {
    p99: dataset.stats.p99,
    "Average Duration": dataset.stats.averageDuration,
    "Fastest Duration": dataset.stats.fastestDuration,
    "% Success": ((dataset.stats.statusCodes['200'] / totalRuns) * 100)
  };
}