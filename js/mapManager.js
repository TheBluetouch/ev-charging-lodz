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
            html: `<div style="background-color: #f59e0b; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">⚡</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });

        // Czerwona ikona - Ultra-fast
        this.icons.ultra = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px; color: white;">⚡</div>`,
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
        const pointsHTML = station.chargingPoints.map(point => {
            const price = DataProcessor.formatPrice(point.prices);
            const availability = DataProcessor.getAvailabilityText(point.availability, point.operationalStatus);
            
            let availabilityHTML = '';
            if (availability) {
                availabilityHTML = `<span class="point-status ${availability.class}">${availability.text}</span>`;
            }
            
            let priceHTML = '';
            if (price) {
                priceHTML = `<br><strong>Cena:</strong> ${price}`;
            }
            
            return `
                <li>
                    <strong>${point.power} kW</strong> ${availabilityHTML}<br>
                    Złącza: ${point.connectorNames.join(', ') || 'Brak informacji'}
                    ${priceHTML}
                </li>
            `;
        }).join('');

        // Płatność i ceny
        const paymentText = station.paymentMethods.join(', ') || 'Brak informacji';
        const isFree = station.paymentMethods.some(m => m.includes('Bezpłatne'));
        
        // Sprawdź czy są rzeczywiste ceny z danych dynamicznych
        const pricesFromPoints = station.chargingPoints
            .map(p => DataProcessor.formatPrice(p.prices))
            .filter(p => p !== null);
        
        let costText;
        if (isFree) {
            costText = '<strong style="color: #10b981;">✓ Bezpłatne ładowanie</strong>';
        } else if (pricesFromPoints.length > 0) {
            const uniquePrices = [...new Set(pricesFromPoints)];
            costText = '<strong>Ceny:</strong><br>' + uniquePrices.map(p => `• ${p}`).join('<br>');
        } else {
            costText = 'Płatne - szczegóły u operatora';
        }

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

