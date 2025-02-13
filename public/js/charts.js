// filepath: /d:/Vamsi/JPMC-RTR/public/js/charts.js
function renderCharts(dailyResults, weeklyResults, monthlyResults, hourlyResults, activeUsers) {
  const dailyCtx = document.getElementById('dailyChart').getContext('2d');
  const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
  const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
  const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
  const activeUsersCtx = document.getElementById('activeUsersChart').getContext('2d');

  new Chart(dailyCtx, {
    type: 'line',
    data: {
      labels: dailyResults.map(result => result.date),
      datasets: [{
        label: 'Daily Checkouts',
        data: dailyResults.map(result => result.count),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    }
  });

  new Chart(weeklyCtx, {
    type: 'line',
    data: {
      labels: weeklyResults.map(result => `Week ${result.week}`),
      datasets: [{
        label: 'Weekly Checkouts',
        data: weeklyResults.map(result => result.count),
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    }
  });

  new Chart(monthlyCtx, {
    type: 'line',
    data: {
      labels: monthlyResults.map(result => `Month ${result.month}`),
      datasets: [{
        label: 'Monthly Checkouts',
        data: monthlyResults.map(result => result.count),
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }]
    }
  });

  new Chart(hourlyCtx, {
    type: 'line',
    data: {
      labels: hourlyResults.map(result => `${result.hour}:00`),
      datasets: [{
        label: 'Hourly Checkouts',
        data: hourlyResults.map(result => result.count),
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    }
  });

  new Chart(activeUsersCtx, {
    type: 'bar',
    data: {
      labels: activeUsers.map(result => `Student ${result.s_id}`),
      datasets: [{
        label: 'Active Users',
        data: activeUsers.map(result => result.count),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    }
  });
}