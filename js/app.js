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

