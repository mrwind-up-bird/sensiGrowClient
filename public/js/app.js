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
    const latestData = await fetchData('/show-latest');
    const allData = await fetchData('/show-all');
    const lastUpdateElement = document.getElementById("last-update-time");

    if (lastUpdateElement) {
        lastUpdateElement.innerText = new Date().toLocaleString();
    }

    // createThermometerChart('thermometerChart', latestData.temp, 0, 100);
    // createHumidityChart('humidityChart', latestData.humidity, 0, 100);
    createThermometerChart('thermometerChart', 24, 0, 100);
    createHumidityChart('humidityChart', 87, 0, 100);
    
    // Tabelle der letzten Messwerte erstellen
    createTable(allData);

    // Verlaufscharts für jeden Sensor erstellen
    createCharts(allData);
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

function createTable(data) {
    const container = document.getElementById("table-container");
    let html = `<div class="row">`;

    data.slice(-1).forEach((entry, index) => {
        if (index % 2 === 0) html += `<div class="col-md-6"><table class="table table-dark table-striped">`;
        html += `
            <tr><th>Timestamp</th><td>${new Date(entry.timestamp).toLocaleString()}</td></tr>
            <tr><th>Temperature</th><td>${entry.temperature} °C</td></tr>
            <tr><th>Humidity</th><td>${entry.humidity} %</td></tr>
            <tr><th>Soil Moisture 001</th><td>${entry.soilMoisture_001} %</td></tr>
            <tr><th>Soil Moisture 002</th><td>${entry.soilMoisture_002} %</td></tr>
            <tr><th>Floor Tray 1</th><td>${entry.tray_001}</td></tr>
            <tr><th>Floor Tray 2</th><td>${entry.tray_002}</td></tr>`;
        if (index % 2 === 1 || index === data.length - 1) html += `</table></div><`;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function createCharts(data) {
    const container = document.getElementById("chart-container");
    container.innerHTML = ''; // Container leeren

    const sensors = [
        { label: 'Temperature (°C)', key: 'temperatur', color: '#D46A6A' },
        { label: 'Humidity (%)', key: 'humidity', color: '#87A8A0' },
        { label: 'Soil Moisture 1', key: 'soilMoisture_001', color: '#F1C40F', binary: true },
        { label: 'Soil Moisture 2', key: 'soilMoisture_002', color: '#E74C3C', binary: true },
        { label: 'Floor Tray 1', key: 'tray_001', color: '#E74C3C', binary: true },
        { label: 'Floor Tray 2', key: 'tray_002', color: '#E74C3C', binary: true },
    ];

    sensors.forEach(sensor => {
        const dataPoints = data.map(entry => ({
            x: new Date(entry.timestamp),
            y: sensor.binary ? (entry[sensor.key] ? 1 : 0) : entry[sensor.key]
        }));

        const chartDiv = document.createElement('div');
        chartDiv.classList.add('chart-container');
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
                    borderWidth: 2,  // Dickere Linie für bessere Sichtbarkeit
                    fill: false,
                    tension: 0.3  // Leichte Kurven
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,  // Deaktiviert automatisches Verhältnis für flexible Größe
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day' },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                            font: { size: 14 } // größere Schrift für Ticks
                        },
                        title: {
                            display: true,
                            text: 'Timestamp',
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: { size: 16, weight: 'bold' }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                            font: { size: 14 } // größere Schrift für Ticks
                        },
                        title: {
                            display: true,
                            text: sensor.label,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: { size: 16, weight: 'bold' }
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
                        titleFont: { size: 14 },
                        bodyFont: { size: 12 }
                    }
                }
            }
        });
    });
}