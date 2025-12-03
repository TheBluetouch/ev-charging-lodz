# 🚗⚡ Mapa Stacji Ładowania EV - Łódź

Interaktywna aplikacja webowa pokazująca stacje ładowania pojazdów elektrycznych w Łodzi z szczegółowymi informacjami o mocy, dostępności i kosztach.

## 📸 Demo

> **Live demo**: [Link do deployed app - wypełnij po deploy]

## ✨ Funkcje

- 🗺️ **Interaktywna mapa** - Leaflet.js z markerami stacji
- ⚡ **Informacje o mocy** - AC, Fast, Ultra-Fast charging
- 🔌 **Typy złączy** - Type 2, CCS Combo, CHAdeMO i inne
- 🕐 **Status dostępności** - Sprawdź czy stacja jest otwarta
- 💰 **NOWOŚĆ: Rzeczywiste ceny** - 1.20 PLN/kWh, 1.80 PLN/kWh, etc.
- 🟢 **NOWOŚĆ: Status punktów real-time** - Dostępny/Zajęty/Niesprawny
- 🔍 **Zaawansowane filtry** - Po mocy, złączach, operatorze
- 📱 **Responsywny design** - Działa na mobile i desktop
- 🧭 **Nawigacja** - Bezpośredni link do Google Maps

## 🛠️ Technologie

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Mapa**: Leaflet.js + OpenStreetMap
- **Clustering**: Leaflet.markercluster
- **Ikony**: Font Awesome
- **Dane**: Statyczne JSON (EIPA - Ewidencja Infrastruktury Paliw Alternatywnych)

## 📂 Struktura projektu

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
├── data/                  # Dane JSON
│   ├── dane_baz.json      # Pule/bazy stacji (5027 rekordów)
│   ├── dane_stacji.json   # Stacje ładowania (6086 rekordów)
│   ├── dane_punktow.json  # Punkty ładowania (12041 rekordów)
│   ├── dane_operatorow.json # Operatorzy (700 rekordów)
│   └── slowniki.json      # Słowniki wartości
├── PLAN_PROJEKTU.md       # Szczegółowy plan projektu
├── INSTRUKCJE_SONNET.md   # Instrukcje wykonawcze krok po kroku
└── README.md              # Ten plik
```

## 🚀 Instalacja i uruchomienie

### Wymagania
- Przeglądarka wspierająca ES6
- Serwer HTTP (dla lokalnego testowania)

### Lokalne uruchomienie

1. **Sklonuj repozytorium**
   ```bash
   git clone <repo-url>
   cd AutaElektryczne
   ```

2. **Uruchom lokalny serwer**
   
   Python 3:
   ```bash
   python3 -m http.server 8000
   ```
   
   Python 2:
   ```bash
   python -m SimpleHTTPServer 8000
   ```
   
   Node.js:
   ```bash
   npx http-server -p 8000
   ```

3. **Otwórz przeglądarkę**
   ```
   http://localhost:8000
   ```

## 📊 Dane

Dane pochodzą z oficjalnej Ewidencji Infrastruktury Paliw Alternatywnych (EIPA).

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

### Przykładowe stacje w Łodzi:
- **Volvo Charging - Łódź Rokicińska** (ul. Rokicińska 164)
  - Operator: GreenWay Polska
  - Godziny: Pon-Pt 8:00-18:00, Sob 9:00-15:00

## 🔧 Konfiguracja

### Zmiana miasta

W pliku `js/app.js` zmień konfigurację:

```javascript
const App = {
    config: {
        city: 'Łódź',           // Nazwa miasta
        centerLat: 51.7592,     // Szerokość geograficzna centrum
        centerLng: 19.4560,     // Długość geograficzna centrum
        zoom: 12                // Poziom przybliżenia
    },
    // ...
};
```

### Dodanie nowego miasta

1. Zmień wartości w `App.config`
2. Funkcja `DataProcessor.processDataForCity()` automatycznie znajdzie stacje dla nowego miasta
3. Jeśli chcesz mieć dropdown wyboru miast, rozszerz konfigurację:

```javascript
const cities = {
    lodz: { name: 'Łódź', lat: 51.7592, lng: 19.4560, zoom: 12 },
    warszawa: { name: 'Warszawa', lat: 52.2297, lng: 21.0122, zoom: 11 },
    krakow: { name: 'Kraków', lat: 50.0647, lng: 19.9450, zoom: 12 }
};
```

## 🎨 Customizacja

### Kolory markerów

W `js/mapManager.js` funkcja `createIcons()`:
- 🟢 Zielony: AC charging (≤22 kW)
- 🟠 Pomarańczowy: Fast charging (23-49 kW)
- 🔴 Czerwony: Ultra-fast charging (≥50 kW)

### Style

Edytuj `css/style.css` aby zmienić:
- Kolory (`--primary-color`, `--success-color`, etc.)
- Szerokość sidebaru (`width: 350px`)
- Breakpoint responsive (`@media (max-width: 768px)`)

## 📱 Responsive Design

Aplikacja automatycznie dostosowuje się do rozmiaru ekranu:
- **Desktop**: Sidebar + mapa obok siebie
- **Mobile/Tablet**: Sidebar jako hamburger menu

## 🧪 Testowanie

### Checklist
- [ ] Mapa wyświetla się poprawnie
- [ ] Markery są widoczne dla Łodzi
- [ ] Kliknięcie markera otwiera popup
- [ ] Filtry działają (każdy z osobna)
- [ ] Lista stacji aktualizuje się po filtrowaniu
- [ ] Kliknięcie stacji na liście centruje mapę
- [ ] Link "Nawiguj" otwiera Google Maps
- [ ] Responsywność na mobile (DevTools -> Device mode)
- [ ] Brak błędów w Console (F12)

### Debug

1. **Otwórz DevTools** (F12)
2. **Console tab** - sprawdź logi:
   ```
   Inicjalizacja aplikacji...
   Przetwarzanie danych dla: Łódź
   Znaleziono X pul w Łódź
   Przetworzono Y stacji
   Mapa zainicjalizowana
   Dodano Y markerów
   Aplikacja gotowa!
   ```
3. **Network tab** - sprawdź czy wszystkie JSON-y się załadowały (200 OK)

## 🚢 Deploy

### GitHub Pages (Szczegółowa instrukcja w `DEPLOY_GITHUB_PAGES.md`)

**Quick deploy:**

```bash
# 1. Inicjalizuj git
git init
git add .
git commit -m "Initial commit - EV Charging Stations Map for Łódź"

# 2. Dodaj remote (ZMIEŃ URL!)
git remote add origin https://github.com/TWOJ-USERNAME/ev-charging-lodz.git
git branch -M main
git push -u origin main

# 3. W GitHub Settings -> Pages -> Source: main branch
# 4. Gotowe! URL: https://TWOJ-USERNAME.github.io/ev-charging-lodz/
```

**Zobacz pełną instrukcję**: [DEPLOY_GITHUB_PAGES.md](DEPLOY_GITHUB_PAGES.md)

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

Przeciągnij folder projektu na [netlify.com/drop](https://app.netlify.com/drop)

## 📈 Roadmap

### Wersja 1.1 (następny sprint)
- [ ] Rozszerzenie na top 10 miast w Polsce
- [ ] Dropdown wyboru miasta
- [ ] Geolokalizacja użytkownika
- [ ] Search bar (wyszukiwanie po nazwie/adresie)

### Wersja 2.0 (przyszłość)
- [ ] Backend (Node.js + PostgreSQL)
- [ ] API dla real-time dostępności punktów
- [ ] User accounts i ulubione stacje
- [ ] Recenzje i oceny stacji
- [ ] Route planning dla EV

### Wersja 3.0 (długofalowo)
- [ ] Mobile app (React Native / Flutter)
- [ ] Integracja z systemami płatności
- [ ] Push notifications
- [ ] Szacowanie czasu i kosztu ładowania
- [ ] Społecznościowe zdjęcia stacji

## 🤝 Współpraca

Pull requesty mile widziane!

### Jak pomóc:
1. Fork projektu
2. Stwórz branch (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📄 Licencja

MIT License - możesz używać tego projektu w dowolny sposób.

## 👥 Autorzy

- **Kacper** - Twórca początkowy - Hackathon Project

## 🙏 Podziękowania

- **EIPA** - za dane o stacjach ładowania
- **Leaflet.js** - za świetną bibliotekę map
- **OpenStreetMap** - za mapy
- **Hackathon organizers** - za motywację

## 📞 Kontakt

Pytania? Issues? Pomysły?
- Otwórz issue na GitHubie
- [Twój email/kontakt]

---

**Zbudowane z ❤️ dla społeczności EV w Łodzi**

*Projekt powstał w ramach hackathonu - od pomysłu do działającej aplikacji w 12 godzin!*

