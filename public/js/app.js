async function fetchData(endpoint) {
    try {
        const response = await axios.get(endpoint);
        return response.data;
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        return [];
    }
}

async function showDashboard() {
    // Hole aktuelle und alle Messdaten
    const latestData = await fetchData('/show-latest');
    const allData = await fetchData('/show-all');

    // Aktualisiere aktuelle Messwerte
    //updateCurrentData(latestData);

    // Erstelle Verlaufscharts
    createCharts(allData);

    // table
    createSingleDatasetTable(latestData);
}

function updateCurrentData(latestData) {
    // Elemente für aktuelle Daten
    document.getElementById("current-temperature").innerText = latestData.temperature || 'N/A';
    document.getElementById("current-humidity").innerText = latestData.humidity || 'N/A';
    document.getElementById("current-soil-moisture-001").innerText = latestData.soilMoisture_001 || 'N/A';
    document.getElementById("current-soil-moisture-002").innerText = latestData.soilMoisture_002 || 'N/A';
    document.getElementById("current-tray-level-001").innerText = latestData.tray_001 ? 'Full' : 'Empty';
    document.getElementById("current-tray-level-002").innerText = latestData.tray_002 ? 'Full' : 'Empty';
}

function createCharts(data) {
    const container = document.getElementById("chart-container");
    container.innerHTML = ''; // Container leeren

    const sensors = [
        { label: 'Temperature (°C)', key: 'temperature', color: '#D46A6A' },
        { label: 'Soil Moisture 1 (%)', key: 'soilMoisture1', color: '#87A8A0' },
        { label: 'Soil Moisture 2 (%)', key: 'soilMoisture2', color: '#87A8A0' },
        { label: 'Humidity (%)', key: 'humidity', color: '#3498DB' },
        { label: 'Tray 1 Level', key: 'trayLevel1', color: '#E74C3C' },
        { label: 'Tray 2 Level', key: 'trayLevel2', color: '#E74C3C' }
    ];

    sensors.forEach(sensor => {
        const dataPoints = data.map(entry => ({
            x: new Date(entry.timestamp),
            y: sensor.binary ? (entry[sensor.key] ? 1 : 0) : entry[sensor.key]
        }));

        const chartDiv = document.createElement('div');
        chartDiv.classList.add('chart-container', 'mb-4');
        const canvas = document.createElement('canvas');
        chartDiv.appendChild(canvas);
        container.appendChild(chartDiv);

        new Chart(canvas, {
            type: 'line',
            data: {
                datasets: [{
                    label: sensor.label,
                    data: dataPoints,
                    borderColor: sensor.color,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'hour' },
                        ticks: {
                            color: '#EDE4C5',
                            font: { size: 12 }
                        },
                        title: {
                            display: true,
                            text: 'Zeit',
                            color: '#EDE4C5',
                            font: { size: 14, weight: 'bold' }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#EDE4C5',
                            font: { size: 12 }
                        },
                        title: {
                            display: true,
                            text: sensor.label,
                            color: '#EDE4C5',
                            font: { size: 14, weight: 'bold' }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#EDE4C5',
                            font: { size: 14 }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        titleFont: { size: 12 },
                        bodyFont: { size: 12 }
                    }
                }
            }
        });
    });
}

function createThermometerChart(canvasId, temperature, min, max) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Temp'],
            datasets: [{
                label: 'Temperature (°C)',
                data: [temperature],
                backgroundColor: getColorForValue(temperature, min, max),
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    display: false,
                    min: min,
                    max: max,
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'), // Primärfarbe
                        font: { size: 14 } // Größere Schrift
                    }
                },
                y: {
                    display: true,
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        font: { size: 14 }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'), 
                        font: { size: 16 }
                    }
                },
                tooltip: {
                    enabled: true,
                    titleFont: { size: 14 }
                }
            }
        }
    });
}

function createHumidityChart(canvasId, humidity, min, max) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Humidity'],
            datasets: [{
                label: 'Humidity (%)',
                data: [humidity, 100 - humidity],
                backgroundColor: ['#3498db', '#dfe6e9']
            }]
        },
        options: {
            rotation: -90,
            circumference: 180,
            cutout: '75%',
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'), 
                        font: { size: 16 }
                    }
                },
                tooltip: {
                    enabled: true,
                    titleFont: { size: 14 }
                }
            }
        }
    });
}

function getColorForValue(value, min, max) {
    const ratio = (value - min) / (max - min);
    const r = Math.round(255 * ratio);
    const g = Math.round(255 * (1 - ratio));
    return `rgb(${r}, ${g}, 66)`;
}

function createSingleDatasetTable(data) {
    const container = document.getElementById("table-container");
    let html = `<div class="row"><div class="col-md-6"><table class="table table-dark table-striped mb-4">`;

    html += `<tr><th>Timestamp</th><td>${new Date(data.timestamp).toLocaleString()}</td></tr>
            <tr><th>Temperature</th><td>${data.temperature} °C</td></tr>
            <tr><th>Humidity</th><td>${data.humidity} %</td></tr>
            <tr><th>Soil Moisture 001</th><td>${data.soilMoisture_001} %</td></tr>
            <tr><th>Soil Moisture 002</th><td>${data.soilMoisture_002} %</td></tr>
            <tr><th>Floor Tray 1</th><td>${data.tray_001}</td></tr>
            <tr><th>Floor Tray 2</th><td>${data.tray_002}</td></tr>
            </table></div></div>`;
    container.innerHTML = html;
}

function createTable(data) {
    const container = document.getElementById("table-container");
    let html = `<div class="row">`;

    data.slice(-1).forEach((entry, index) => {
        if (index % 2 === 0) html += `<div class="col-md-6"><table class="table table-dark table-striped mb-4">`;
        html += `
            <tr><th>Timestamp</th><td>${new Date(entry.timestamp).toLocaleString()}</td></tr>
            <tr><th>Temperature</th><td>${entry.temperature} °C</td></tr>
            <tr><th>Humidity</th><td>${entry.humidity} %</td></tr>
            <tr><th>Soil Moisture 001</th><td>${entry.soilMoisture_001} %</td></tr>
            <tr><th>Soil Moisture 002</th><td>${entry.soilMoisture_002} %</td></tr>
            <tr><th>Floor Tray 1</th><td>${entry.tray_001}</td></tr>
            <tr><th>Floor Tray 2</th><td>${entry.tray_002}</td></tr>`;
        if (index % 2 === 1 || index === data.length - 1) html += `</table></div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}