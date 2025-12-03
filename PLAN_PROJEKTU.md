# PLAN PROJEKTU - MAPA STACJI ŁADOWANIA EV
## Hackathon - 12 godzin

---

## 📊 ANALIZA DANYCH

### Struktura danych w plikach JSON:

1. **dane_baz.json** (5027 linii) - PULE/BAZY stacji
   - `id` - unikalny identyfikator puli
   - `operator_id` - ID operatora (łączy z dane_operatorow.json)
   - `name` - nazwa lokalizacji
   - `latitude`, `longitude` - współrzędne GPS
   - `street`, `house_number`, `postal_code`, `city` - adres
   - `accessibility` - opis dostępności i obiektów w pobliżu
   - `operating_hours[]` - godziny otwarcia (weekday, from_time, to_time)
   - `charging`, `refilling`, `h2refilling` - typy usług

2. **dane_stacji.json** (6086 linii) - STACJE ładowania
   - `id` - unikalny identyfikator stacji
   - `pool_id` - ID puli (łączy z dane_baz.json)
   - `latitude`, `longitude` - współrzędne GPS
   - `authentication_methods[]` - metody autentykacji (bitmaski)
   - `payment_methods[]` - metody płatności (bitmaski)
   - `location` - szczegółowa lokalizacja (province, district, community, city)
   - `type` - typ stacji (E = energia elektryczna)

3. **dane_punktow.json** (12041 linii) - PUNKTY ładowania
   - `id` - unikalny identyfikator punktu
   - `station_id` - ID stacji (łączy z dane_stacji.json)
   - `code` - kod punktu
   - `charging_solutions[]` - rozwiązania ładowania (mode, power)
   - `connectors[]` - złącza (interfaces[], power, cable_attached)

4. **dane_operatorow.json** (700 linii) - OPERATORZY
   - `id` - unikalny identyfikator operatora
   - `name` - nazwa operatora
   - `code` - kod operatora
   - `phone`, `email`, `website` - dane kontaktowe
   - `type` - typ firmy (1=operator, 2=dostawca, 3=oba)

5. **slowniki.json** - SŁOWNIKI
   - `charging_mode` - tryby ładowania
   - `connector_interface` - typy złączy (Type 2, CHAdeMO, CCS Combo, etc.)
   - `station_authentication_method` - metody autentykacji
   - `station_payment_method` - metody płatności
   - `weekday` - dni tygodnia

6. **dane_dynamiczne.json** (prawie pusty)
   - Prawdopodobnie dane na żywo o dostępności - do pominięcia na start

### Relacje między danymi:
```
dane_operatorow (operator)
    ↓ operator_id
dane_baz (pool/baza)
    ↓ pool_id
dane_stacji (station)
    ↓ station_id
dane_punktow (charging point)
```

### Dane dla Łodzi:
- Znaleziono stacje dla miasta "Łódź"
- Przykład: Volvo Charging - Łódź Rokicińska (51.75458086, 19.57318519)
- Operatorzy: GreenWay Polska, DoubleTree by Hilton Łódź, inne

---

## 🎯 CEL PROJEKTU

Stworzyć prostą, funkcjonalną aplikację webową pokazującą:
1. **Mapę interaktywną** (Leaflet.js) z markerami stacji ładowania
2. **Informacje o stacjach** po kliknięciu:
   - Nazwa i adres
   - Dostępność (godziny otwarcia)
   - Typy złączy i moc ładowania
   - Operator i kontakt
   - Metody płatności
   - Koszt ładowania (jeśli dostępny)
3. **Filtrowanie** stacji po:
   - Moc ładowania (AC/DC, kW)
   - Typ złącza (Type 2, CCS, CHAdeMO)
   - Dostępność (otwarte teraz)
   - Operator
4. **Skalowalność** - łatwe rozszerzenie na inne miasta

---

## 🏗️ ARCHITEKTURA ROZWIĄZANIA

### Stack technologiczny:
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (lub React - do decyzji)
- **Mapa**: Leaflet.js + OpenStreetMap
- **Dane**: Statyczne JSON (przetwarzane po stronie klienta)
- **Hosting**: Można hostować na GitHub Pages / Vercel / Netlify

### Struktura projektu:
```
AutaElektryczne/
├── index.html              # Główny plik HTML
├── css/
│   └── style.css          # Style aplikacji
├── js/
│   ├── app.js             # Główna logika aplikacji
│   ├── dataProcessor.js   # Przetwarzanie i łączenie danych
│   ├── mapManager.js      # Zarządzanie mapą Leaflet
│   └── filters.js         # Logika filtrowania
├── data/                  # Dane JSON (istniejące pliki)
│   ├── dane_baz.json
│   ├── dane_stacji.json
│   ├── dane_punktow.json
│   ├── dane_operatorow.json
│   └── slowniki.json
├── assets/
│   └── icons/            # Ikony dla markerów
└── README.md             # Dokumentacja projektu
```

---

## ⏱️ HARMONOGRAM - 12 GODZIN

### FAZA 1: Setup i przygotowanie danych (2h) - PRIORYTET 1
**Godziny: 0:00 - 2:00**

1. **Setup projektu (30 min)**
   - Utworzenie struktury katalogów
   - Setup podstawowego HTML z Leaflet.js
   - Konfiguracja podstawowego CSS (responsive)

2. **Przetwarzanie danych (1.5h)**
   - Napisanie modułu `dataProcessor.js`:
     - Łączenie danych z różnych plików JSON
     - Filtrowanie danych dla Łodzi
     - Denormalizacja - stworzenie płaskiej struktury dla każdej stacji:
       ```javascript
       {
         stationId: 123,
         poolName: "Volvo Charging Łódź",
         latitude: 51.754,
         longitude: 19.573,
         address: "ul. Rokicińska 164",
         city: "Łódź",
         operator: { name: "GreenWay", phone: "...", email: "..." },
         operatingHours: [...],
         chargingPoints: [
           {
             power: 50,
             mode: "DC Fast Charging",
             connectors: ["CCS Combo", "CHAdeMO"]
           }
         ],
         paymentMethods: ["Bezpłatne", "Karta"],
         authMethods: ["Aplikacja", "RFID"],
         isOpenNow: true
       }
       ```
   - Zapisanie przetworzonej struktury do nowego pliku lub cache

### FAZA 2: Podstawowa funkcjonalność mapy (3h) - PRIORYTET 1
**Godziny: 2:00 - 5:00**

1. **Inicjalizacja mapy (45 min)**
   - Konfiguracja Leaflet.js
   - Wyśrodkowanie na Łódź (51.7592, 19.4560)
   - Dodanie warstwy OpenStreetMap
   - Responsive design dla mobile

2. **Markery stacji (1h)**
   - Dodanie markerów dla wszystkich stacji w Łodzi
   - Różne ikony dla różnych typów stacji:
     - Zielone: AC charging (≤22 kW)
     - Pomarańczowe: Fast charging (23-49 kW)
     - Czerwone: DC Ultra-fast (≥50 kW)
   - Clustering dla wielu blisko siebie stacji (MarkerCluster plugin)

3. **Podstawowe popupy (1h 15min)**
   - Popup z informacjami po kliknięciu markera:
     - Nazwa stacji
     - Adres
     - Godziny otwarcia
     - Lista punktów ładowania z mocą i złączami
     - Operator i kontakt
     - Metody płatności

### FAZA 3: Funkcje filtrowania i UI (2.5h) - PRIORYTET 2
**Godziny: 5:00 - 7:30**

1. **Panel boczny / górny (45 min)**
   - Layout responsywny
   - Toggle menu dla mobile
   - Sekcje: Filtry, Lista stacji, Legenda

2. **Filtry (1.5h)**
   - Filtr po mocy ładowania (slidery lub checkboxy)
   - Filtr po typie złącza (multi-select)
   - Filtr "Otwarte teraz" (checkbox)
   - Filtr po operatorze (dropdown)
   - Przycisk "Resetuj filtry"
   - Real-time update markerów na mapie

3. **Lista stacji (30 min)**
   - Lista przefiltrowanych stacji w panelu
   - Kliknięcie -> wyśrodkowanie mapy na stacji
   - Pokazanie liczby wyników

### FAZA 4: Szczegóły i UX (2h) - PRIORYTET 2
**Godziny: 7:30 - 9:30**

1. **Zaawansowane informacje (1h)**
   - Obliczanie kosztu ładowania (szacunkowy):
     - Jeśli darmowe -> "Bezpłatne"
     - Jeśli płatne -> "Płatne - sprawdź u operatora" + link
   - Godziny otwarcia:
     - Pokazanie aktualnych godzin
     - Status: OTWARTE (zielone) / ZAMKNIĘTE (czerwone)
   - Ikony dla złączy (Type 2, CCS, CHAdeMO)
   - Link do Google Maps z nawigacją

2. **Optymalizacje UX (1h)**
   - Loading spinner podczas ładowania danych
   - Error handling (brak danych, błędy sieci)
   - Tooltips dla ikon i filtrów
   - Smooth scrolling i animacje
   - Dark mode toggle (opcjonalnie)

### FAZA 5: Skalowalność i dokumentacja (1.5h) - PRIORYTET 3
**Godziny: 9:30 - 11:00**

1. **Przygotowanie do rozszerzenia (1h)**
   - Refaktoryzacja kodu:
     - Parametryzacja miasta (city filter)
     - Dropdown wyboru miasta (obecnie tylko Łódź)
     - Przygotowanie struktury dla wielu miast
   - Opcjonalnie: automatyczne wyśrodkowanie mapy na wybrane miasto
   - Config file z ustawieniami miast:
     ```javascript
     const cities = {
       lodz: { name: "Łódź", lat: 51.7592, lng: 19.4560, zoom: 12 },
       warszawa: { name: "Warszawa", lat: 52.2297, lng: 21.0122, zoom: 11 }
     };
     ```

2. **Dokumentacja (30 min)**
   - README.md z:
     - Opis projektu
     - Instrukcja instalacji
     - Jak dodać nowe miasto
     - Źródła danych
     - Technologie użyte
     - Screenshots

### FAZA 6: Testy i deploy (1h) - PRIORYTET 3
**Godziny: 11:00 - 12:00**

1. **Testy (30 min)**
   - Test na różnych przeglądarkach (Chrome, Firefox, Safari)
   - Test responsywności (mobile, tablet, desktop)
   - Test wszystkich filtrów
   - Test performance (ładowanie dużej ilości markerów)

2. **Deploy (30 min)**
   - Hosting na GitHub Pages lub Vercel
   - Optymalizacja plików JSON (minifikacja)
   - Kompresja obrazków
   - Cache strategy

---

## 🚀 QUICK START - MVP w 6 godzin

Jeśli czas się kurczy, priorytet na MVP:

### MVP Scope (6h):
1. **Mapa z markerami** dla Łodzi (2h)
2. **Popupy z podstawowymi info** (1.5h)
3. **Prosty filtr po mocy** ładowania (1h)
4. **Responsywny design** (1h)
5. **Deploy** (0.5h)

Pomiń:
- Zaawansowane filtry
- Listę stacji w panelu
- Skalowalność na wiele miast
- Dark mode

---

## 📋 INSTRUKCJE DLA SONNET 4.5

### KROK 1: Przygotowanie środowiska
```bash
# Struktura projektu
mkdir -p css js data assets/icons

# Przenieś istniejące pliki JSON do folderu data
mv dane_*.json data/
mv slowniki.json data/
```

### KROK 2: Stwórz index.html z Leaflet
- Załaduj Leaflet CSS i JS z CDN
- Stwórz kontener na mapę (100vh)
- Dodaj podstawowy layout: nagłówek + mapa + panel boczny

### KROK 3: Przetwórz dane (dataProcessor.js)
**Najważniejszy krok!**

Napisz funkcje:
1. `loadAllData()` - załaduj wszystkie JSON-y
2. `mergeData(city)` - połącz dane dla konkretnego miasta:
   ```javascript
   // Dla każdej stacji:
   // 1. Znajdź pool po pool_id w dane_stacji
   // 2. Znajdź charging points po station_id w dane_punktow
   // 3. Znajdź operatora po operator_id z pool
   // 4. Dekoduj bitmaski payment_methods i auth_methods używając slowniki.json
   // 5. Przetłumacz connector interfaces na nazwy (slowniki.json)
   // 6. Oblicz isOpenNow() na podstawie operating_hours
   ```
3. `decodeAuthMethods(bitmask)` - dekoduj metodę autentykacji z bitmaski
4. `decodePaymentMethods(bitmask)` - dekoduj metodę płatności
5. `getConnectorNames(interfaceIds)` - pobierz nazwy złączy
6. `isOpenNow(operatingHours)` - sprawdź czy otwarte teraz

### KROK 4: Inicjalizuj mapę (mapManager.js)
```javascript
// Przykład:
const map = L.map('map').setView([51.7592, 19.4560], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Dodaj MarkerCluster
const markers = L.markerClusterGroup();

// Dla każdej stacji:
const marker = L.marker([station.latitude, station.longitude], {
  icon: getIconByPower(station.maxPower)
});
marker.bindPopup(createPopupContent(station));
markers.addLayer(marker);

map.addLayer(markers);
```

### KROK 5: Stwórz popupy
Template HTML dla popupu:
```html
<div class="station-popup">
  <h3>{nazwa stacji}</h3>
  <p class="address">{adres}</p>
  <div class="status {open/closed}">
    <span class="status-dot"></span> {OTWARTE/ZAMKNIĘTE}
  </div>
  <h4>Godziny otwarcia:</h4>
  <p>{godziny}</p>
  <h4>Punkty ładowania:</h4>
  <ul>
    {lista punktów z mocą i złączami}
  </ul>
  <h4>Operator:</h4>
  <p>{operator} | {telefon}</p>
  <h4>Płatność:</h4>
  <p>{metody płatności}</p>
  <a href="https://maps.google.com/?q={lat},{lng}" target="_blank">
    🗺️ Nawiguj
  </a>
</div>
```

### KROK 6: Implementuj filtry (filters.js)
```javascript
// Filtry:
let filters = {
  minPower: 0,
  maxPower: 350,
  connectorTypes: [],
  openNow: false,
  operators: []
};

function applyFilters() {
  const filtered = stations.filter(station => {
    // Sprawdź każdy filtr
    if (filters.minPower > 0 && station.maxPower < filters.minPower) return false;
    if (filters.openNow && !station.isOpenNow) return false;
    // ... etc
    return true;
  });
  
  updateMapMarkers(filtered);
  updateStationList(filtered);
}
```

### KROK 7: Style (style.css)
- Responsive grid/flexbox
- Panel boczny z overflow scroll
- Kolory dla statusów (zielony/czerwony)
- Style dla popupów Leaflet
- Media queries dla mobile

### KROK 8: Deploy
```bash
# GitHub Pages:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <repo-url>
git push -u origin main

# W repo settings -> Pages -> Source: main branch
```

---

## 💡 WSKAZÓWKI TECHNICZNE

### Dekodowanie bitmasek:
```javascript
// Przykład dla payment_methods = [1, 2]
// 1 = Bezpłatne
// 2 = Płatne, umowa z operatorem
// Suma: 3 (bitmaska)

function decodePaymentMethods(values) {
  const dictionary = slowniki.station_payment_method;
  return values.map(val => {
    const method = dictionary.find(m => m.id === val);
    return method ? method.description : 'Nieznane';
  });
}
```

### Sprawdzanie godzin otwarcia:
```javascript
function isOpenNow(operatingHours) {
  if (!operatingHours || operatingHours.length === 0) {
    return true; // Domyślnie otwarte 24/7
  }
  
  const now = new Date();
  const weekday = now.getDay() === 0 ? 7 : now.getDay(); // 1=pon, 7=niedz
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const todayHours = operatingHours.find(h => h.weekday === weekday);
  if (!todayHours) return false;
  
  const [fromH, fromM] = todayHours.from_time.split(':').map(Number);
  const [toH, toM] = todayHours.to_time.split(':').map(Number);
  const fromMinutes = fromH * 60 + fromM;
  const toMinutes = toH * 60 + toM;
  
  return currentTime >= fromMinutes && currentTime <= toMinutes;
}
```

### Ikony markerów według mocy:
```javascript
const greenIcon = L.icon({
  iconUrl: 'assets/icons/marker-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const orangeIcon = L.icon({ /* ... */ });
const redIcon = L.icon({ /* ... */ });

function getIconByPower(maxPower) {
  if (maxPower <= 22) return greenIcon;      // AC
  if (maxPower <= 49) return orangeIcon;     // Fast
  return redIcon;                             // Ultra-fast
}
```

### Optymalizacja wydajności:
- Użyj `L.markerClusterGroup()` dla wielu markerów
- Lazy loading dla dużych JSON-ów
- Debounce dla filtrów (300ms delay)
- Virtual scrolling dla długiej listy stacji

---

## 🎨 UI/UX Best Practices

1. **Kolory**:
   - Zielony (#10B981): Dostępne, AC charging
   - Pomarańczowy (#F59E0B): Fast charging
   - Czerwony (#EF4444): Ultra-fast, niedostępne
   - Niebieski (#3B82F6): Aktualne wybrane

2. **Ikony**:
   - Użyj Font Awesome lub Material Icons dla złączy
   - Pinezki dla markerów
   - Status kropka (dot) dla otwarte/zamknięte

3. **Responsywność**:
   - Mobile first approach
   - Hamburger menu dla filtrów na mobile
   - Touch-friendly buttons (min 44px)
   - Fullscreen map na mobile

4. **Accessibility**:
   - Alt text dla obrazków
   - ARIA labels dla interaktywnych elementów
   - Kontrast kolorów (WCAG AA)

---

## 📊 METRYKI SUKCESU

### Minimalne (MVP):
- [ ] Mapa wyświetla się poprawnie
- [ ] Wszystkie stacje w Łodzi mają markery
- [ ] Popupy pokazują podstawowe info
- [ ] Przynajmniej 1 działający filtr
- [ ] Responsywność mobile/desktop
- [ ] Deploy na live URL

### Optymalne (Full):
- [ ] Wszystkie 4 typy filtrów działają
- [ ] Lista stacji w panelu bocznym
- [ ] Status "otwarte teraz" działa
- [ ] Ikony różne dla różnych mocy
- [ ] Smooth UX (animacje, loading)
- [ ] Przygotowane na rozszerzenie (wiele miast)
- [ ] Dokumentacja README

### Bonus (Nice-to-have):
- [ ] Dark mode
- [ ] Geolokalizacja użytkownika
- [ ] Routing (A->B) z Leaflet Routing Machine
- [ ] Szacowanie czasu ładowania
- [ ] Integracja z API na żywo (dostępność)
- [ ] PWA (Progressive Web App)

---

## ⚠️ POTENCJALNE PROBLEMY I ROZWIĄZANIA

### Problem 1: Duże pliki JSON spowalniają ładowanie
**Rozwiązanie**:
- Pre-processing: Stwórz mniejsze pliki tylko dla Łodzi
- Użyj kompresji gzip na serwerze
- Lazy loading - ładuj dane tylko dla widocznego obszaru mapy

### Problem 2: Bitmaski w authentication_methods i payment_methods
**Rozwiązanie**:
- Wartości to faktyczne ID z słownika, nie bitmaski
- Mapuj bezpośrednio po ID używając slowniki.json

### Problem 3: Brak danych o cenach ładowania
**Rozwiązanie**:
- Pokazuj "Bezpłatne" jeśli payment_methods zawiera ID 1
- W innych przypadkach: "Płatne - szczegóły u operatora" + link do website

### Problem 4: Dużo markerów na małym obszarze
**Rozwiązanie**:
- Leaflet.markercluster plugin
- Grupowanie stacji w jednej lokalizacji (ten sam adres)

### Problem 5: Godziny otwarcia są nieregularne
**Rozwiązanie**:
- Niektóre stacje nie mają operating_hours -> traktuj jako 24/7
- Sprawdzaj czy closing_hours[] nie jest puste

---

## 📚 ZASOBY I LINKI

### Biblioteki:
- Leaflet.js: https://leafletjs.com/
- Leaflet.markercluster: https://github.com/Leaflet/Leaflet.markercluster
- Font Awesome (ikony): https://fontawesome.com/

### CDN Links:
```html
<!-- Leaflet CSS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<!-- MarkerCluster -->
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
```

### Dokumentacja API:
- OpenStreetMap Tiles: https://wiki.openstreetmap.org/wiki/Tile_servers
- Google Maps dla nawigacji: `https://maps.google.com/?q=lat,lng`

### Inspiracje design:
- PlugShare: https://www.plugshare.com/
- ChargeMap: https://chargemap.com/
- ElectricityMaps: https://app.electricitymaps.com/

---

## 🎯 STRATEGIA PREZENTACJI (na hackathonie)

### Storytelling:
1. **Problem**: Kierowcy EV w Łodzi nie wiedzą gdzie ładować
2. **Rozwiązanie**: Nasza aplikacja - prosta, szybka, intuicyjna
3. **Demo**: Pokaż konkretny use case:
   - "Jestem w centrum Łodzi i potrzebuję szybkie ładowanie CCS"
   - Filtr -> znajdź stację -> nawiguj

### Demo flow:
1. Otwórz stronę -> mapa Łodzi z markerami
2. Pokaż różne kolory markerów (wytłumacz legendę)
3. Kliknij marker -> popup z szczegółami
4. Użyj filtra "Fast charging + otwarte teraz"
5. Lista stacji się aktualizuje
6. Kliknij "Nawiguj" -> Google Maps
7. **Bonus**: Pokaż responsywność na telefonie

### Przyszłość projektu:
- Rozszerzenie na wszystkie miasta w Polsce
- Real-time dostępność (API integracja)
- Routing i planowanie tras dla EV
- Społecznościowe recenzje i zdjęcia stacji

---

## ✅ CHECKLIST PRZED PREZENTACJĄ

- [ ] Mapa działa płynnie (bez lagów)
- [ ] Wszystkie linki działają (operator website, nawigacja)
- [ ] Przetestowane na mobile (demo na telefonie!)
- [ ] Przygotowane 3 przykładowe scenariusze do demo
- [ ] Screenshots / video backup (na wypadek problemów z live demo)
- [ ] Repo na GitHubie (publiczne, z README)
- [ ] Live URL (GitHub Pages / Vercel)
- [ ] Przygotowane slide/notatki na 3-5 min pitch

---

## 🚀 ROADMAP PO HACKATHONIE

### Faza 1 (1-2 tygodnie):
- Rozszerzenie na top 10 miast w Polsce
- Dodanie reszty operatorów
- API dla real-time dostępności

### Faza 2 (1 miesiąc):
- Backend (Node.js + PostgreSQL)
- User accounts i ulubione stacje
- Push notifications dla dostępności

### Faza 3 (3 miesiące):
- Mobile app (React Native)
- Route planning z optymalizacją dla EV
- Integracja z systemami płatności

---

## 💪 MOTYWACJA

**Pamiętaj**: To hackathon! Priorytet to działający produkt, nie perfekcja.

- **Zrób MVP w pierwszych 6 godzinach**
- Testuj często (co godzinę odpal przeglądarkę)
- Commit do gita co 30-60 minut
- Jeśli coś nie działa - pomiń i wróć później
- Estetyka ważna, ale funkcjonalność > wygląd

**Good luck! 🚗⚡**

---

_Dokument stworzony: 2025-12-03_
_Aktualizacja: Na bieżąco podczas pracy_

