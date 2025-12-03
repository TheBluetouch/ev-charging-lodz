const DataProcessor = {
    // Cache dla załadowanych danych
    cache: {
        pools: null,
        stations: null,
        points: null,
        operators: null,
        dictionaries: null,
        dynamic: null
    },

    // Załaduj wszystkie dane
    async loadAllData() {
        try {
            const [pools, stations, points, operators, dictionaries, dynamic] = await Promise.all([
                fetch('data/dane_baz.json').then(r => r.json()),
                fetch('data/dane_stacji.json').then(r => r.json()),
                fetch('data/dane_punktow.json').then(r => r.json()),
                fetch('data/dane_operatorow.json').then(r => r.json()),
                fetch('data/slowniki.json').then(r => r.json()),
                fetch('data/dane_dynamiczne.json').then(r => r.json()).catch(() => ({data: []}))
            ]);

            this.cache.pools = pools.data;
            this.cache.stations = stations.data;
            this.cache.points = points.data;
            this.cache.operators = operators.data;
            this.cache.dictionaries = dictionaries;
            this.cache.dynamic = dynamic.data || [];

            console.log(`Załadowano ${this.cache.dynamic.length} wpisów danych dynamicznych (ceny i dostępność)`);

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
                const chargingPoints = stationPoints.map(point => {
                    // Znajdź dane dynamiczne dla tego punktu
                    const dynamicData = this.cache.dynamic.find(d => d.point_id === point.id);
                    
                    return {
                        id: point.id,
                        code: point.code,
                        power: this.getMaxPower(point),
                        chargingModes: point.charging_solutions || [],
                        connectors: point.connectors || [],
                        connectorNames: this.getConnectorNames(point.connectors || []),
                        // Dodaj dane dynamiczne
                        availability: dynamicData?.status?.availability,
                        operationalStatus: dynamicData?.status?.status,
                        prices: dynamicData?.prices || [],
                        lastUpdate: dynamicData?.status?.ts
                    };
                });

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
    },

    // Sformatuj cenę dla punktu ładowania
    formatPrice(prices) {
        if (!prices || prices.length === 0) {
            return null;
        }

        const priceInfo = prices[0]; // Weź pierwszą cenę
        if (priceInfo.price) {
            return `${priceInfo.price} PLN/${priceInfo.unit || 'kWh'}`;
        }
        return null;
    },

    // Sprawdź dostępność punktu
    getAvailabilityText(availability, operationalStatus) {
        if (availability === undefined && operationalStatus === undefined) {
            return null;
        }

        if (availability === 1 && operationalStatus === 1) {
            return { text: 'Dostępny', class: 'available' };
        } else if (availability === 0) {
            return { text: 'Zajęty', class: 'busy' };
        } else if (operationalStatus === 0) {
            return { text: 'Niesprawny', class: 'offline' };
        }
        return { text: 'Status nieznany', class: 'unknown' };
    }
};

