const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 80;

// Basis-URL Ihrer API
const apiBaseUrl = 'https://kzyrq44xwe.execute-api.eu-central-1.amazonaws.com';

// Statische Dateien bereitstellen
app.use(express.static('public'));

// Beispiel-Daten senden
app.get('/collect', async (req, res) => {
    const data = {
        temp: 25.5,
        humidity: 60,
        waterSensorTop: true,
        waterSensorBottom: false,
        heatSensor: 30,
        ppmSensor: 400,
        soilMoistureSensors: [60, 70],
        relaisStates: [true, false],
        pinArray: [1, 0],
        thresholds: [30, 40]
    };
    
    try {
        const response = await axios.post(`${apiBaseUrl}/collect`, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        res.send("Daten erfolgreich gesendet!");
    } catch (error) {
        res.status(500).send("Fehler beim Senden der Daten.");
    }
});

// Route zum Abrufen des letzten Datensatzes
app.get('/show-latest', async (req, res) => {
    try {
        const response = await axios.get(`${apiBaseUrl}/show`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send("Fehler beim Abrufen des letzten Datensatzes.");
    }
});

// Route zum Abrufen aller Datensätze
app.get('/show-all', async (req, res) => {
    try {
        const response = await axios.get(`${apiBaseUrl}/show/all`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send("Fehler beim Abrufen aller Datensätze.");
    }
});

// Starten des Servers
app.listen(PORT, () => {
    console.log(`Webanwendung läuft auf http://localhost:${PORT}`);
});
