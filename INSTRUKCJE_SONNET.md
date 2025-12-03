# INSTRUKCJE WYKONAWCZE DLA SONNET 4.5
## Aplikacja Mapy Stacji Ładowania EV - Łódź

---

## 🎯 ZADANIE

Stwórz działającą aplikację webową pokazującą stacje ładowania pojazdów elektrycznych w Łodzi na interaktywnej mapie.

**Czas realizacji**: 6-12 godzin (w zależności od zakresu)  
**Miasto docelowe**: Łódź (z możliwością rozszerzenia)

---

## 📂 DOSTĘPNE DANE

W katalogu projektu znajdują się pliki JSON:

1. **dane_baz.json** - Pule/bazy stacji (5027 rekordów)
2. **dane_stacji.json** - Stacje ładowania (6086 rekordów)
3. **dane_punktow.json** - Punkty ładowania (12041 rekordów)
4. **dane_operatorow.json** - Operatorzy stacji (700 rekordów)
5. **slowniki.json** - Słowniki wartości (typy złączy, metody płatności, etc.)
6. **dane_dynamiczne.json** - Dane dynamiczne (można pominąć na start)

### Relacje między danymi:
```
Operator (dane_operatorow.json)
    ↓ operator_id
Pool/Baza (dane_baz.json) - zawiera: nazwa, adres, współrzędne, godziny
    ↓ pool_id
Station (dane_stacji.json) - zawiera: metody płatności, autentykacji
    ↓ station_id
Charging Point (dane_punktow.json) - zawiera: moc, złącza, tryby ładowania
```

---

## 🏗️ CZĘŚĆ 1: SETUP PROJEKTU (30 min)

### Krok 1.1: Struktura katalogów

Stwórz następującą strukturę (w głównym katalogu projektu):

```
AutaElektryczne/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── dataProcessor.js
│   ├── mapManager.js
│   └── filters.js
├── data/              # Już istnieje - pliki JSON
│   ├── dane_baz.json
│   ├── dane_stacji.json
│   ├── dane_punktow.json
│   ├── dane_operatorow.json
│   └── slowniki.json
└── assets/
    └── icons/
```

**Akcja**: Utwórz te katalogi i pliki (puste na razie)

---

### Krok 1.2: index.html - Struktura podstawowa

Stwórz `index.html`:

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stacje Ładowania EV - Łódź</title>
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <!-- MarkerCluster CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
    
    <!-- Font Awesome dla ikon -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Header -->
    <header>
        <div class="container">
            <h1><i class="fas fa-charging-station"></i> Stacje Ładowania EV - Łódź</h1>
            <button id="toggle-sidebar" class="btn-toggle">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </header>

    <!-- Main Container -->
    <div class="main-container">
        <!-- Sidebar -->
        <aside id="sidebar" class="sidebar">
            <!-- Loading -->
            <div id="loading" class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Ładowanie danych...</p>
            </div>

            <!-- Filters Section -->
            <section id="filters-section" class="filters-section" style="display: none;">
                <h2>Filtry</h2>
                
                <!-- Open Now -->
                <div class="filter-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="filter-open-now">
                        <span>Tylko otwarte teraz</span>
                    </label>
                </div>

                <!-- Power Range -->
                <div class="filter-group">
                    <label>Moc ładowania (kW)</label>
                    <div class="power-filters">
                        <label class="checkbox-label">
                            <input type="checkbox" id="filter-ac" checked>
                            <span>AC (≤22 kW)</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="filter-fast" checked>
                            <span>Fast (23-49 kW)</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="filter-ultra" checked>
                            <span>Ultra-Fast (≥50 kW)</span>
                        </label>
                    </div>
                </div>

                <!-- Connector Type -->
                <div class="filter-group">
                    <label for="filter-connector">Typ złącza</label>
                    <select id="filter-connector" multiple>
                        <option value="all" selected>Wszystkie</option>
                        <!-- Będzie wypełnione dynamicznie -->
                    </select>
                </div>

                <!-- Operator -->
                <div class="filter-group">
                    <label for="filter-operator">Operator</label>
                    <select id="filter-operator">
                        <option value="all">Wszyscy</option>
                        <!-- Będzie wypełnione dynamicznie -->
                    </select>
                </div>

                <!-- Reset Filters -->
                <button id="reset-filters" class="btn btn-secondary">
                    <i class="fas fa-redo"></i> Resetuj filtry
                </button>
            </section>

            <!-- Results Section -->
            <section id="results-section" class="results-section" style="display: none;">
                <h2>
                    Stacje (<span id="results-count">0</span>)
                </h2>
                <div id="stations-list" class="stations-list">
                    <!-- Lista będzie wypełniona dynamicznie -->
                </div>
            </section>

            <!-- Legend -->
            <section class="legend">
                <h3>Legenda</h3>
                <div class="legend-item">
                    <span class="marker-icon green"></span> AC ≤22 kW
                </div>
                <div class="legend-item">
                    <span class="marker-icon orange"></span> Fast 23-49 kW
                </div>
                <div class="legend-item">
                    <span class="marker-icon red"></span> Ultra-Fast ≥50 kW
                </div>
            </section>
        </aside>

        <!-- Map Container -->
        <main class="map-container">
            <div id="map"></div>
        </main>
    </div>

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <!-- MarkerCluster JS -->
    <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
    
    <!-- Custom Scripts -->
    <script src="js/dataProcessor.js"></script>
    <script src="js/mapManager.js"></script>
    <script src="js/filters.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

**Akcja**: Zapisz ten plik jako `index.html`

---

### Krok 1.3: style.css - Style podstawowe

Stwórz `css/style.css`:

```css
/* Reset i podstawowe style */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary-color: #2563eb;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --dark: #1f2937;
    --light: #f3f4f6;
    --border: #e5e7eb;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: var(--dark);
    overflow: hidden;
}

/* Header */
header {
    background: var(--primary-color);
    color: white;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: relative;
    z-index: 1000;
}

header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

header h1 {
    font-size: 1.5rem;
    font-weight: 600;
}

.btn-toggle {
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 1.2rem;
    display: none;
}

.btn-toggle:hover {
    background: rgba(255,255,255,0.3);
}

/* Main Container */
.main-container {
    display: flex;
    height: calc(100vh - 64px);
}

/* Sidebar */
.sidebar {
    width: 350px;
    background: white;
    border-right: 1px solid var(--border);
    overflow-y: auto;
    padding: 1.5rem;
    transition: transform 0.3s ease;
}

.sidebar section {
    margin-bottom: 2rem;
}

.sidebar h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--dark);
}

.sidebar h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: var(--dark);
}

/* Loading */
.loading {
    text-align: center;
    padding: 2rem;
    color: var(--primary-color);
}

.loading i {
    font-size: 2rem;
    margin-bottom: 1rem;
}

/* Filters */
.filter-group {
    margin-bottom: 1.5rem;
}

.filter-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    font-weight: 400 !important;
}

.checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    font-size: 0.9rem;
}

select[multiple] {
    height: 100px;
}

/* Buttons */
.btn {
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-secondary {
    background: var(--light);
    color: var(--dark);
}

.btn-secondary:hover {
    background: var(--border);
}

/* Stations List */
.stations-list {
    max-height: 400px;
    overflow-y: auto;
}

.station-item {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
}

.station-item:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.station-item h4 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: var(--dark);
}

.station-item p {
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
}

.station-item .status {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    margin-top: 0.5rem;
}

.station-item .status.open {
    background: #d1fae5;
    color: #065f46;
}

.station-item .status.closed {
    background: #fee2e2;
    color: #991b1b;
}

/* Legend */
.legend {
    padding: 1rem;
    background: var(--light);
    border-radius: 0.375rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
}

.marker-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
}

.marker-icon.green {
    background: var(--success-color);
}

.marker-icon.orange {
    background: var(--warning-color);
}

.marker-icon.red {
    background: var(--danger-color);
}

/* Map Container */
.map-container {
    flex: 1;
    position: relative;
}

#map {
    width: 100%;
    height: 100%;
}

/* Leaflet Popup Custom Styles */
.leaflet-popup-content {
    margin: 0;
    width: 280px !important;
}

.station-popup {
    padding: 1rem;
}

.station-popup h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: var(--dark);
}

.station-popup .address {
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 0.75rem;
}

.station-popup .status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 1rem;
}

.station-popup .status.open {
    background: #d1fae5;
    color: #065f46;
}

.station-popup .status.closed {
    background: #fee2e2;
    color: #991b1b;
}

.station-popup .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
}

.station-popup h4 {
    font-size: 0.9rem;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: var(--dark);
}

.station-popup ul {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
}

.station-popup li {
    padding: 0.5rem;
    background: var(--light);
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
}

.station-popup p {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
}

.station-popup a {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    text-decoration: none;
    border-radius: 0.375rem;
    font-size: 0.85rem;
    text-align: center;
}

.station-popup a:hover {
    background: #1d4ed8;
}

/* Responsive */
@media (max-width: 768px) {
    .btn-toggle {
        display: block;
    }

    .sidebar {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        z-index: 999;
        transform: translateX(-100%);
        box-shadow: 2px 0 4px rgba(0,0,0,0.1);
    }

    .sidebar.active {
        transform: translateX(0);
    }

    .map-container {
        width: 100%;
    }
}
```

**Akcja**: Zapisz ten plik jako `css/style.css`

---

## 🔧 CZĘŚĆ 2: PRZETWARZANIE DANYCH (1.5h)

To najważniejsza część! Musisz połączyć dane z różnych plików.

### Krok 2.1: dataProcessor.js - Moduł przetwarzania

Stwórz `js/dataProcessor.js`:

```javascript
const DataProcessor = {
    // Cache dla załadowanych danych
    cache: {
        pools: null,
        stations: null,
        points: null,
        operators: null,
        dictionaries: null
    },

    // Załaduj wszystkie dane
    async loadAllData() {
        try {
            const [pools, stations, points, operators, dictionaries] = await Promise.all([
                fetch('data/dane_baz.json').then(r => r.json()),
                fetch('data/dane_stacji.json').then(r => r.json()),
                fetch('data/dane_punktow.json').then(r => r.json()),
                fetch('data/dane_operatorow.json').then(r => r.json()),
                fetch('data/slowniki.json').then(r => r.json())
            ]);

            this.cache.pools = pools.data;
            this.cache.stations = stations.data;
            this.cache.points = points.data;
            this.cache.operators = operators.data;
            this.cache.dictionaries = dictionaries;

            return true;
        } catch (error) {
            console.error('Błąd ładowania danych:', error);
            return false;
        }
    },

    // Przetwórz dane dla konkretnego miasta
    processDataForCity(cityName) {
        console.log(`Przetwarzanie danych dla: ${cityName}`);
        
        // Filtruj pule po mieście
        const cityPools = this.cache.pools.filter(pool => 
            pool.city && pool.city.toLowerCase().includes(cityName.toLowerCase())
        );

        console.log(`Znaleziono ${cityPools.length} pul w ${cityName}`);

        // Dla każdej puli znajdź stacje
        const processedStations = [];

        cityPools.forEach(pool => {
            // Znajdź wszystkie stacje dla tej puli
            const poolStations = this.cache.stations.filter(s => s.pool_id === pool.id);

            poolStations.forEach(station => {
                // Znajdź punkty ładowania dla tej stacji
                const stationPoints = this.cache.points.filter(p => p.station_id === station.id);

                // Znajdź operatora
                const operator = this.cache.operators.find(o => o.id === pool.operator_id);

                // Przetwórz punkty ładowania
                const chargingPoints = stationPoints.map(point => ({
                    id: point.id,
                    code: point.code,
                    power: this.getMaxPower(point),
                    chargingModes: point.charging_solutions || [],
                    connectors: point.connectors || [],
                    connectorNames: this.getConnectorNames(point.connectors || [])
                }));

                // Oblicz maksymalną moc dla stacji
                const maxPower = Math.max(...chargingPoints.map(p => p.power), 0);

                // Dekoduj metody płatności i autentykacji
                const paymentMethods = this.decodePaymentMethods(station.payment_methods || []);
                const authMethods = this.decodeAuthMethods(station.authentication_methods || []);

                // Sprawdź czy otwarte teraz
                const isOpen = this.isOpenNow(pool.operating_hours || []);

                // Zbuduj pełny obiekt stacji
                processedStations.push({
                    stationId: station.id,
                    poolId: pool.id,
                    poolName: pool.name,
                    code: pool.code,
                    latitude: pool.latitude || station.latitude,
                    longitude: pool.longitude || station.longitude,
                    address: {
                        street: pool.street,
                        houseNumber: pool.house_number,
                        postalCode: pool.postal_code,
                        city: pool.city,
                        full: this.formatAddress(pool)
                    },
                    location: station.location || {},
                    accessibility: pool.accessibility,
                    operatingHours: pool.operating_hours || [],
                    closingHours: pool.closing_hours || [],
                    operator: operator ? {
                        id: operator.id,
                        name: operator.name,
                        code: operator.code,
                        phone: operator.phone,
                        email: operator.email,
                        website: operator.website
                    } : null,
                    chargingPoints: chargingPoints,
                    maxPower: maxPower,
                    powerCategory: this.getPowerCategory(maxPower),
                    paymentMethods: paymentMethods,
                    authMethods: authMethods,
                    isOpenNow: isOpen,
                    features: pool.features || []
                });
            });
        });

        console.log(`Przetworzono ${processedStations.length} stacji`);
        return processedStations;
    },

    // Pomocnicze funkcje

    getMaxPower(point) {
        let maxPower = 0;
        
        // Sprawdź charging_solutions
        if (point.charging_solutions && point.charging_solutions.length > 0) {
            point.charging_solutions.forEach(solution => {
                if (solution.power > maxPower) {
                    maxPower = solution.power;
                }
            });
        }

        // Sprawdź connectors
        if (point.connectors && point.connectors.length > 0) {
            point.connectors.forEach(connector => {
                if (connector.power > maxPower) {
                    maxPower = connector.power;
                }
            });
        }

        return maxPower;
    },

    getPowerCategory(power) {
        if (power <= 22) return 'ac';           // AC charging
        if (power <= 49) return 'fast';         // Fast charging
        return 'ultra';                          // Ultra-fast charging
    },

    getConnectorNames(connectors) {
        const dict = this.cache.dictionaries.connector_interface;
        const names = [];

        connectors.forEach(connector => {
            if (connector.interfaces) {
                connector.interfaces.forEach(interfaceId => {
                    const connectorInfo = dict.find(d => d.id === interfaceId);
                    if (connectorInfo && !names.includes(connectorInfo.name)) {
                        names.push(connectorInfo.name);
                    }
                });
            }
        });

        return names;
    },

    decodePaymentMethods(values) {
        const dict = this.cache.dictionaries.station_payment_method;
        return values.map(val => {
            const method = dict.find(m => m.id === val);
            return method ? method.description : 'Nieznane';
        });
    },

    decodeAuthMethods(values) {
        const dict = this.cache.dictionaries.station_authentication_method;
        return values.map(val => {
            const method = dict.find(m => m.id === val);
            return method ? method.description : 'Nieznane';
        });
    },

    formatAddress(pool) {
        const parts = [];
        if (pool.street) parts.push(pool.street);
        if (pool.house_number) parts.push(pool.house_number);
        if (pool.postal_code) parts.push(pool.postal_code);
        if (pool.city) parts.push(pool.city);
        return parts.join(', ');
    },

    isOpenNow(operatingHours) {
        // Jeśli brak godzin, zakładamy że otwarte 24/7
        if (!operatingHours || operatingHours.length === 0) {
            return true;
        }

        const now = new Date();
        const weekday = now.getDay() === 0 ? 7 : now.getDay(); // 1=pon, 7=niedz
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Znajdź godziny dla dzisiejszego dnia
        const todayHours = operatingHours.find(h => h.weekday === weekday);
        
        if (!todayHours) {
            return false; // Brak godzin dla dzisiaj = zamknięte
        }

        // Parsuj godziny
        const [fromH, fromM] = todayHours.from_time.split(':').map(Number);
        const [toH, toM] = todayHours.to_time.split(':').map(Number);
        const fromMinutes = fromH * 60 + fromM;
        const toMinutes = toH * 60 + toM;

        return currentMinutes >= fromMinutes && currentMinutes <= toMinutes;
    },

    getOperatingHoursText(operatingHours) {
        if (!operatingHours || operatingHours.length === 0) {
            return '24/7';
        }

        const daysDict = this.cache.dictionaries.weekday;
        const grouped = {};

        operatingHours.forEach(oh => {
            const key = `${oh.from_time}-${oh.to_time}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            const dayName = daysDict.find(d => d.id === oh.weekday)?.name || oh.weekday;
            grouped[key].push(dayName);
        });

        const lines = [];
        Object.keys(grouped).forEach(key => {
            const days = grouped[key].join(', ');
            lines.push(`${days}: ${key}`);
        });

        return lines.join('<br>');
    },

    // Pobierz wszystkie unikalne typy złączy
    getAllConnectorTypes(stations) {
        const types = new Set();
        stations.forEach(station => {
            station.chargingPoints.forEach(point => {
                point.connectorNames.forEach(name => types.add(name));
            });
        });
        return Array.from(types).sort();
    },

    // Pobierz wszystkich unikalnych operatorów
    getAllOperators(stations) {
        const operators = new Map();
        stations.forEach(station => {
            if (station.operator) {
                operators.set(station.operator.id, station.operator.name);
            }
        });
        return Array.from(operators.entries()).map(([id, name]) => ({id, name})).sort((a, b) => a.name.localeCompare(b.name));
    }
};
```

**Akcja**: Zapisz ten plik jako `js/dataProcessor.js`

---

## 🗺️ CZĘŚĆ 3: ZARZĄDZANIE MAPĄ (1.5h)

### Krok 3.1: mapManager.js - Manager mapy Leaflet

Stwórz `js/mapManager.js`:

```javascript
const MapManager = {
    map: null,
    markersLayer: null,
    stations: [],
    icons: {},

    // Inicjalizuj mapę
    init(centerLat, centerLng, zoom = 12) {
        // Inicjalizacja mapy
        this.map = L.map('map').setView([centerLat, centerLng], zoom);

        // Dodaj warstwę OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Inicjalizuj MarkerCluster
        this.markersLayer = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        });

        // Stwórz ikony
        this.createIcons();

        console.log('Mapa zainicjalizowana');
    },

    // Stwórz ikony dla różnych typów stacji
    createIcons() {
        const iconSize = [30, 45];
        const iconAnchor = [15, 45];
        const popupAnchor = [0, -45];

        // Zielona ikona - AC
        this.icons.ac = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">⚡</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });

        // Pomarańczowa ikona - Fast
        this.icons.fast = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: #f59e0b; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">⚡⚡</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });

        // Czerwona ikona - Ultra-fast
        this.icons.ultra = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px; color: white;">⚡⚡</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
    },

    // Dodaj markery dla stacji
    addStations(stations) {
        // Wyczyść poprzednie markery
        this.markersLayer.clearLayers();
        this.stations = stations;

        stations.forEach(station => {
            // Wybierz ikonę na podstawie mocy
            const icon = this.icons[station.powerCategory] || this.icons.ac;

            // Stwórz marker
            const marker = L.marker(
                [station.latitude, station.longitude],
                { icon: icon }
            );

            // Dodaj popup
            const popupContent = this.createPopupContent(station);
            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            });

            // Dodaj do warstwy
            this.markersLayer.addLayer(marker);
        });

        // Dodaj warstwę do mapy
        this.map.addLayer(this.markersLayer);

        console.log(`Dodano ${stations.length} markerów`);
    },

    // Stwórz zawartość popupu
    createPopupContent(station) {
        const statusClass = station.isOpenNow ? 'open' : 'closed';
        const statusText = station.isOpenNow ? 'OTWARTE' : 'ZAMKNIĘTE';

        // Godziny otwarcia
        const hoursText = DataProcessor.getOperatingHoursText(station.operatingHours);

        // Punkty ładowania
        const pointsHTML = station.chargingPoints.map(point => `
            <li>
                <strong>${point.power} kW</strong><br>
                Złącza: ${point.connectorNames.join(', ') || 'Brak informacji'}
            </li>
        `).join('');

        // Płatność
        const paymentText = station.paymentMethods.join(', ') || 'Brak informacji';
        const isFree = station.paymentMethods.some(m => m.includes('Bezpłatne'));
        const costText = isFree ? '<strong>Bezpłatne ładowanie</strong>' : 'Płatne - szczegóły u operatora';

        // Operator
        const operatorHTML = station.operator ? `
            <p>
                <strong>${station.operator.name}</strong><br>
                ${station.operator.phone ? `📞 ${station.operator.phone}<br>` : ''}
                ${station.operator.website ? `<a href="${station.operator.website}" target="_blank">🌐 Website</a>` : ''}
            </p>
        ` : '<p>Brak informacji o operatorze</p>';

        return `
            <div class="station-popup">
                <h3>${station.poolName}</h3>
                <p class="address">${station.address.full}</p>
                
                <div class="status ${statusClass}">
                    <span class="status-dot"></span>
                    ${statusText}
                </div>

                <h4>Godziny otwarcia:</h4>
                <p>${hoursText}</p>

                <h4>Punkty ładowania (${station.chargingPoints.length}):</h4>
                <ul>${pointsHTML || '<li>Brak punktów</li>'}</ul>

                <h4>Koszt:</h4>
                <p>${costText}</p>

                <h4>Metody płatności:</h4>
                <p>${paymentText}</p>

                <h4>Operator:</h4>
                ${operatorHTML}

                ${station.accessibility ? `<h4>Dostępność:</h4><p>${station.accessibility}</p>` : ''}

                <a href="https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}" 
                   target="_blank" 
                   class="navigate-btn">
                    <i class="fas fa-directions"></i> Nawiguj
                </a>
            </div>
        `;
    },

    // Wyśrodkuj mapę na stacji
    centerOnStation(stationId) {
        const station = this.stations.find(s => s.stationId === stationId);
        if (station) {
            this.map.setView([station.latitude, station.longitude], 16);
            
            // Znajdź i otwórz popup
            this.markersLayer.eachLayer(layer => {
                if (layer.getLatLng().lat === station.latitude && 
                    layer.getLatLng().lng === station.longitude) {
                    layer.openPopup();
                }
            });
        }
    }
};
```

**Akcja**: Zapisz ten plik jako `js/mapManager.js`

---

## 🔍 CZĘŚĆ 4: FILTRY (1h)

### Krok 4.1: filters.js - Logika filtrowania

Stwórz `js/filters.js`:

```javascript
const Filters = {
    allStations: [],
    filteredStations: [],
    activeFilters: {
        openNow: false,
        powerAC: true,
        powerFast: true,
        powerUltra: true,
        connectorTypes: ['all'],
        operator: 'all'
    },

    // Inicjalizuj filtry
    init(stations) {
        this.allStations = stations;
        this.filteredStations = stations;

        // Wypełnij dropdowny
        this.populateConnectorTypes();
        this.populateOperators();

        // Dodaj event listenery
        this.attachEventListeners();

        // Początkowe filtrowanie
        this.applyFilters();
    },

    // Wypełnij dropdown typów złączy
    populateConnectorTypes() {
        const select = document.getElementById('filter-connector');
        const types = DataProcessor.getAllConnectorTypes(this.allStations);

        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            select.appendChild(option);
        });
    },

    // Wypełnij dropdown operatorów
    populateOperators() {
        const select = document.getElementById('filter-operator');
        const operators = DataProcessor.getAllOperators(this.allStations);

        operators.forEach(op => {
            const option = document.createElement('option');
            option.value = op.id;
            option.textContent = op.name;
            select.appendChild(option);
        });
    },

    // Dodaj event listenery
    attachEventListeners() {
        // Open now checkbox
        document.getElementById('filter-open-now').addEventListener('change', (e) => {
            this.activeFilters.openNow = e.target.checked;
            this.applyFilters();
        });

        // Power checkboxes
        document.getElementById('filter-ac').addEventListener('change', (e) => {
            this.activeFilters.powerAC = e.target.checked;
            this.applyFilters();
        });

        document.getElementById('filter-fast').addEventListener('change', (e) => {
            this.activeFilters.powerFast = e.target.checked;
            this.applyFilters();
        });

        document.getElementById('filter-ultra').addEventListener('change', (e) => {
            this.activeFilters.powerUltra = e.target.checked;
            this.applyFilters();
        });

        // Connector type
        document.getElementById('filter-connector').addEventListener('change', (e) => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
            this.activeFilters.connectorTypes = selected.length > 0 ? selected : ['all'];
            this.applyFilters();
        });

        // Operator
        document.getElementById('filter-operator').addEventListener('change', (e) => {
            this.activeFilters.operator = e.target.value;
            this.applyFilters();
        });

        // Reset button
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });
    },

    // Zastosuj filtry
    applyFilters() {
        this.filteredStations = this.allStations.filter(station => {
            // Filtr: otwarte teraz
            if (this.activeFilters.openNow && !station.isOpenNow) {
                return false;
            }

            // Filtr: moc ładowania
            const powerCategory = station.powerCategory;
            if (powerCategory === 'ac' && !this.activeFilters.powerAC) return false;
            if (powerCategory === 'fast' && !this.activeFilters.powerFast) return false;
            if (powerCategory === 'ultra' && !this.activeFilters.powerUltra) return false;

            // Filtr: typ złącza
            if (!this.activeFilters.connectorTypes.includes('all')) {
                const stationConnectors = station.chargingPoints.flatMap(p => p.connectorNames);
                const hasMatchingConnector = this.activeFilters.connectorTypes.some(type =>
                    stationConnectors.includes(type)
                );
                if (!hasMatchingConnector) return false;
            }

            // Filtr: operator
            if (this.activeFilters.operator !== 'all') {
                if (!station.operator || station.operator.id != this.activeFilters.operator) {
                    return false;
                }
            }

            return true;
        });

        // Aktualizuj mapę i listę
        this.updateUI();
    },

    // Aktualizuj UI po filtrowaniu
    updateUI() {
        // Aktualizuj markery na mapie
        MapManager.addStations(this.filteredStations);

        // Aktualizuj listę stacji
        this.updateStationsList();

        // Aktualizuj licznik wyników
        document.getElementById('results-count').textContent = this.filteredStations.length;
    },

    // Aktualizuj listę stacji
    updateStationsList() {
        const container = document.getElementById('stations-list');
        container.innerHTML = '';

        if (this.filteredStations.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Brak stacji spełniających kryteria</p>';
            return;
        }

        this.filteredStations.forEach(station => {
            const item = document.createElement('div');
            item.className = 'station-item';
            
            const statusClass = station.isOpenNow ? 'open' : 'closed';
            const statusText = station.isOpenNow ? 'Otwarte' : 'Zamknięte';

            item.innerHTML = `
                <h4>${station.poolName}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${station.address.full}</p>
                <p><i class="fas fa-bolt"></i> Max ${station.maxPower} kW</p>
                <p><i class="fas fa-plug"></i> ${station.chargingPoints.length} punkt(y)</p>
                <span class="status ${statusClass}">${statusText}</span>
            `;

            item.addEventListener('click', () => {
                MapManager.centerOnStation(station.stationId);
                // Na mobile zamknij sidebar po kliknięciu
                if (window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.remove('active');
                }
            });

            container.appendChild(item);
        });
    },

    // Resetuj filtry
    resetFilters() {
        // Resetuj wartości
        this.activeFilters = {
            openNow: false,
            powerAC: true,
            powerFast: true,
            powerUltra: true,
            connectorTypes: ['all'],
            operator: 'all'
        };

        // Resetuj UI
        document.getElementById('filter-open-now').checked = false;
        document.getElementById('filter-ac').checked = true;
        document.getElementById('filter-fast').checked = true;
        document.getElementById('filter-ultra').checked = true;
        document.getElementById('filter-connector').selectedIndex = 0;
        document.getElementById('filter-operator').value = 'all';

        // Zastosuj
        this.applyFilters();
    }
};
```

**Akcja**: Zapisz ten plik jako `js/filters.js`

---

## 🚀 CZĘŚĆ 5: GŁÓWNA APLIKACJA (30 min)

### Krok 5.1: app.js - Główna logika

Stwórz `js/app.js`:

```javascript
// Główna aplikacja
const App = {
    config: {
        city: 'Łódź',
        centerLat: 51.7592,
        centerLng: 19.4560,
        zoom: 12
    },

    async init() {
        console.log('Inicjalizacja aplikacji...');

        // Pokaż loading
        this.showLoading(true);

        try {
            // 1. Załaduj dane
            const success = await DataProcessor.loadAllData();
            if (!success) {
                throw new Error('Nie udało się załadować danych');
            }

            // 2. Przetwórz dane dla Łodzi
            const stations = DataProcessor.processDataForCity(this.config.city);
            
            if (stations.length === 0) {
                throw new Error(`Nie znaleziono stacji w ${this.config.city}`);
            }

            // 3. Inicjalizuj mapę
            MapManager.init(this.config.centerLat, this.config.centerLng, this.config.zoom);

            // 4. Dodaj markery
            MapManager.addStations(stations);

            // 5. Inicjalizuj filtry
            Filters.init(stations);

            // 6. Ukryj loading, pokaż UI
            this.showLoading(false);
            this.showUI(true);

            // 7. Setup sidebar toggle dla mobile
            this.setupMobileMenu();

            console.log('Aplikacja gotowa!');

        } catch (error) {
            console.error('Błąd inicjalizacji:', error);
            alert(`Wystąpił błąd: ${error.message}`);
            this.showLoading(false);
        }
    },

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'block' : 'none';
    },

    showUI(show) {
        document.getElementById('filters-section').style.display = show ? 'block' : 'none';
        document.getElementById('results-section').style.display = show ? 'block' : 'none';
    },

    setupMobileMenu() {
        const toggleBtn = document.getElementById('toggle-sidebar');
        const sidebar = document.getElementById('sidebar');

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Zamknij sidebar przy kliknięciu na mapę (mobile)
        document.getElementById('map').addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    }
};

// Uruchom aplikację po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
```

**Akcja**: Zapisz ten plik jako `js/app.js`

---

## ✅ CZĘŚĆ 6: TESTOWANIE I URUCHOMIENIE (30 min)

### Krok 6.1: Uruchom lokalnie

1. Otwórz terminal w katalogu projektu

2. Uruchom prosty serwer HTTP:
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Lub Python 2
   python -m SimpleHTTPServer 8000
   
   # Lub Node.js (jeśli masz npx)
   npx http-server -p 8000
   ```

3. Otwórz przeglądarkę: `http://localhost:8000`

### Krok 6.2: Sprawdź funkcjonalność

- [ ] Mapa się ładuje
- [ ] Widać markery stacji w Łodzi
- [ ] Kliknięcie markera pokazuje popup
- [ ] Filtry działają (testuj każdy)
- [ ] Lista stacji aktualizuje się
- [ ] Responsywność na mobile (F12 -> Device mode)
- [ ] Link "Nawiguj" otwiera Google Maps

### Krok 6.3: Debug w konsoli

Otwórz DevTools (F12) i sprawdź:
- Czy są błędy w Console?
- Czy wszystkie pliki JSON się załadowały? (Network tab)
- Ile stacji zostało przetworzonych?

---

## 🌐 CZĘŚĆ 7: DEPLOY (30 min)

### Opcja A: GitHub Pages (zalecane)

1. Stwórz repo na GitHub
2. Push kod:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - EV Charging Stations Map"
   git branch -M main
   git remote add origin <URL-TWOJEGO-REPO>
   git push -u origin main
   ```

3. W repo Settings -> Pages:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Save

4. Po 1-2 minutach strona będzie dostępna pod: `https://<username>.github.io/<repo-name>/`

### Opcja B: Vercel

1. Zainstaluj Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Podążaj za instrukcjami w terminalu

---

## 🎨 OPCJONALNE ULEPSZENIA (jeśli zostanie czas)

### 1. Geolokalizacja użytkownika
```javascript
// Dodaj do mapManager.js
addUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            L.marker([lat, lng], {
                icon: L.divIcon({
                    html: '📍',
                    className: 'user-location',
                    iconSize: [30, 30]
                })
            }).addTo(this.map).bindPopup('Twoja lokalizacja');
        });
    }
}
```

### 2. Dark Mode
```javascript
// Dodaj przełącznik w header
// CSS - dodaj klasę .dark-mode do body i zmień kolory
```

### 3. Search bar
```javascript
// Dodaj input do sidebaru
// Filtruj stacje po nazwie/adresie w czasie rzeczywistym
```

---

## 🐛 TROUBLESHOOTING

### Problem: Mapa się nie wyświetla
**Rozwiązanie**: Sprawdź czy Leaflet CSS załadował się przed JS

### Problem: Brak danych
**Rozwiązanie**: Sprawdź ścieżki do plików JSON (data/ folder)

### Problem: Markery nie pokazują się
**Rozwiązanie**: Sprawdź console - czy latitude/longitude są poprawne?

### Problem: CORS error przy lokalnym testowaniu
**Rozwiązanie**: Użyj lokalnego serwera HTTP (nie otwieraj file://)

---

## 📝 CHECKLIST PRZED PREZENTACJĄ

- [ ] Aplikacja działa lokalnie
- [ ] Deployed na live URL
- [ ] Wszystkie filtry działają
- [ ] Responsywne na mobile
- [ ] Console bez błędów
- [ ] README.md z opisem projektu
- [ ] Screenshot/demo GIF dla README

---

## 🎯 PREZENTACJA NA HACKATHONIE

### Struktura (5 minut):

**Minuta 1 - Problem**:
"Kierowcy pojazdów elektrycznych w Łodzi nie mają jednego miejsca, gdzie mogą szybko sprawdzić dostępne stacje ładowania, ich moc i koszty."

**Minuty 2-3 - Demo**:
- Pokaż mapę z markerami
- Kliknij stację -> popup z szczegółami
- Użyj filtru (np. "tylko ultra-fast + otwarte teraz")
- Pokaż nawigację do stacji
- Pokaż responsywność na mobile

**Minuta 4 - Technologia**:
- Leaflet.js dla mapy
- Dane z oficjalnych źródeł (EIPA)
- Vanilla JS - szybkie i lekkie
- Open source - kod na GitHubie

**Minuta 5 - Przyszłość**:
- Rozszerzenie na więcej miast
- Real-time dostępność punktów
- Planowanie tras z optymalizacją dla EV
- Mobile app

---

## ✅ SUKCES!

Jeśli wykonałeś wszystkie kroki, masz działającą aplikację!

**Co osiągnąłeś**:
- ✅ Interaktywną mapę z Leaflet
- ✅ Wyświetlanie stacji ładowania dla Łodzi
- ✅ Szczegółowe informacje o każdej stacji
- ✅ Filtry po mocy, typie złącza, dostępności
- ✅ Responsywny design
- ✅ Deployed na live URL
- ✅ Gotowy do prezentacji produkt!

**Good luck na hackathonie! 🚀⚡🚗**

