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

            // Sprawdź dostępność punktów
            const availablePoints = station.chargingPoints.filter(p => p.availability === 1 && p.operationalStatus === 1).length;
            const totalPoints = station.chargingPoints.length;
            
            let availabilityHTML = '';
            if (availablePoints !== totalPoints) {
                availabilityHTML = `<p><i class="fas fa-info-circle"></i> Dostępne: ${availablePoints}/${totalPoints}</p>`;
            }

            // Sprawdź czy są ceny
            const hasPrice = station.chargingPoints.some(p => p.prices && p.prices.length > 0 && p.prices[0].price);
            let priceHTML = '';
            if (hasPrice) {
                const price = station.chargingPoints.find(p => p.prices && p.prices[0]?.price)?.prices[0];
                if (price) {
                    priceHTML = `<p><i class="fas fa-tag"></i> Od ${price.price} PLN/${price.unit}</p>`;
                }
            }

            item.innerHTML = `
                <h4>${station.poolName}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${station.address.full}</p>
                <p><i class="fas fa-bolt"></i> Max ${station.maxPower} kW</p>
                <p><i class="fas fa-plug"></i> ${totalPoints} punkt(y)</p>
                ${availabilityHTML}
                ${priceHTML}
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

