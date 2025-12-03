# 📊 Informacje o danych dla Łodzi

## Przegląd dostępnych stacji w Łodzi

### Znalezione stacje

Z analizy pliku `dane_baz.json` wynika, że dla Łodzi dostępne są następujące stacje:

#### 1. Volvo Charging - Łódź Rokicińska
- **Adres**: ul. Rokicińska 164, 92-412 Łódź
- **Współrzędne**: 51.75458086, 19.57318519
- **Operator**: GreenWay Polska Sp. z o.o. (Volvo Lodz Bednarek)
- **Kontakt**: 
  - Tel: 0048583251017
  - Email: bok@greenwaypolska.pl
  - Web: http://greenwaypolska.pl
- **Godziny otwarcia**:
  - Poniedziałek - Piątek: 08:00 - 18:00
  - Sobota: 09:00 - 15:00
  - Niedziela: Zamknięte
- **Typ**: Stacja ładowania elektrycznego
- **ID puli**: 99257
- **Kod**: PL-7R5-PGWPL1343

### Struktura danych

Każda stacja w Łodzi będzie zawierać:

1. **Informacje podstawowe**:
   - Nazwa stacji
   - Adres (ulica, numer, kod pocztowy, miasto)
   - Współrzędne GPS (latitude, longitude)

2. **Informacje o operatorze**:
   - Nazwa operatora
   - Telefon kontaktowy
   - Email
   - Strona internetowa

3. **Godziny dostępności**:
   - Dni tygodnia (1=poniedziałek, 7=niedziela)
   - Godziny otwarcia (from_time, to_time)
   - Status otwarcia w czasie rzeczywistym

4. **Punkty ładowania** (po połączeniu z dane_punktow.json):
   - Moc ładowania (kW)
   - Tryby ładowania (Mode 3 AC, Mode 4 DC, etc.)
   - Typy złączy (Type 2, CCS Combo, CHAdeMO)
   - Liczba dostępnych punktów

5. **Metody płatności i autentykacji**:
   - Bezpłatne / Płatne
   - Karta płatnicza
   - Aplikacja mobilna
   - Karta RFID
   - Umowa z operatorem

### Oczekiwana liczba stacji

Z wstępnej analizy:
- **Pule/bazy**: Minimum 1 (Volvo Charging)
- **Stacje**: Do ustalenia po przetworzeniu danych
- **Punkty ładowania**: Do ustalenia po przetworzeniu danych

*Uwaga: Pełna liczba zostanie ustalona po uruchomieniu skryptu przetwarzającego dane.*

## Przykładowa przetworzona stacja

Po przetworzeniu przez `dataProcessor.js`, stacja będzie wyglądać tak:

```json
{
  "stationId": 12345,
  "poolId": 99257,
  "poolName": "Volvo Charging - Łódź Rokicińska",
  "code": "PL-7R5-PGWPL1343",
  "latitude": 51.75458086,
  "longitude": 19.57318519,
  "address": {
    "street": "Rokicińska",
    "houseNumber": "164",
    "postalCode": "92-412",
    "city": "Łódź",
    "full": "Rokicińska 164, 92-412 Łódź"
  },
  "location": {
    "province": "łódzkie",
    "district": "Łódź",
    "community": "Łódź",
    "city": "Łódź"
  },
  "operatingHours": [
    {"weekday": 1, "from_time": "08:00", "to_time": "18:00"},
    {"weekday": 2, "from_time": "08:00", "to_time": "18:00"},
    {"weekday": 3, "from_time": "08:00", "to_time": "18:00"},
    {"weekday": 4, "from_time": "08:00", "to_time": "18:00"},
    {"weekday": 5, "from_time": "08:00", "to_time": "18:00"},
    {"weekday": 6, "from_time": "09:00", "to_time": "15:00"}
  ],
  "operator": {
    "id": 5,
    "name": "GreenWay Polska Sp. z o.o.",
    "code": "PL-7R5",
    "phone": "0048583251017",
    "email": "bok@greenwaypolska.pl",
    "website": "http://greenwaypolska.pl"
  },
  "chargingPoints": [
    {
      "id": 67890,
      "code": "PL-7R5-E99257-01",
      "power": 50,
      "chargingModes": [
        {"mode": 7, "power": 50}
      ],
      "connectors": [
        {"interfaces": [29], "power": 50, "cable_attached": true},
        {"interfaces": [11], "power": 50, "cable_attached": true}
      ],
      "connectorNames": ["IEC-62196-T2-COMBO", "CHADEMO"]
    }
  ],
  "maxPower": 50,
  "powerCategory": "ultra",
  "paymentMethods": [
    "Bezpłatne ładowanie",
    "Płatne ładowanie, umowa z operatorem"
  ],
  "authMethods": [
    "Nieograniczony dostęp (brak autentykacji / identyfikacji użytkownika)",
    "Aplikacje – dedykowana aplikacja na smartfon lub przeglądarkowa"
  ],
  "isOpenNow": true,
  "features": ["energy"]
}
```

## Typy złączy dostępne w słowniku

Z pliku `slowniki.json`:

### Najważniejsze złącza dla EV:
- **IEC-62196-T2-F-NOCABLE** (ID: 10) - Type 2 (bez kabla)
- **IEC-62196-T2-F-CABLE** (ID: 17) - Type 2 (z kablem)
- **IEC-62196-T2-COMBO** (ID: 29) - CCS Combo Type 2
- **IEC-62196-T1-COMBO** (ID: 30) - CCS Combo Type 1
- **CHADEMO** (ID: 11) - CHAdeMO
- **TESLA-SPECIFIC** (ID: 25) - Złącze Tesla

### Inne złącza:
- Domowe (Type C, E, F, etc.)
- IEC 309-2
- China GB

## Kategorie mocy

Aplikacja klasyfikuje stacje według mocy:

- **AC (zielony marker)**: ≤22 kW
  - Ładowanie domowe, wolne
  - Czas ładowania: 6-8 godzin dla pełnego aku

- **Fast (pomarańczowy marker)**: 23-49 kW
  - Ładowanie przyspieszone
  - Czas ładowania: 2-4 godziny

- **Ultra-Fast (czerwony marker)**: ≥50 kW
  - Ładowanie szybkie DC
  - Czas ładowania: 30-60 minut dla 80%

## Metody płatności

Z pliku `slowniki.json`:

- **ID 0**: Nieokreślone
- **ID 1**: Bezpłatne ładowanie
- **ID 2**: Płatne ładowanie, umowa z operatorem
- **ID 4**: Płatne ładowanie, karta płatnicza
- **ID 8**: Płatne ładowanie, gotówka
- **ID 16**: Płatne ładowanie, karta przedpłacona
- **ID 32**: Płatne ładowanie, karta flotowa
- **ID 64**: Płatne ładowanie, przelew
- **ID 128**: Płatne ładowanie, płatność internetowa

## Metody autentykacji

Z pliku `slowniki.json`:

- **ID 0**: Nieograniczony dostęp (brak autentykacji)
- **ID 1**: Brak dostępu
- **ID 2**: Karta RFID / NFC - Mifare Classic
- **ID 4**: Karta RFID / NFC - Mifare Desifare
- **ID 16**: PINPAD
- **ID 32**: Aplikacje mobilne
- **ID 128**: ISO/IEC 15118 – PLC
- **ID 512**: Telefonicznie głosowo
- **ID 1024**: Telefoniczne SMS

## Jak używać tych danych

1. **dataProcessor.js** automatycznie:
   - Znajdzie wszystkie pule dla Łodzi
   - Połączy je ze stacjami (pool_id)
   - Połączy stacje z punktami ładowania (station_id)
   - Połączy pule z operatorami (operator_id)
   - Zdekoduje bitmaski dla metod płatności i autentykacji
   - Przetłumaczy ID złączy na nazwy

2. **mapManager.js** wyświetli:
   - Markery na mapie (różne kolory dla różnych mocy)
   - Popupy z pełnymi informacjami
   - Clustering dla blisko położonych stacji

3. **filters.js** umożliwi:
   - Filtrowanie po mocy
   - Filtrowanie po typie złącza
   - Filtrowanie po statusie (otwarte/zamknięte)
   - Filtrowanie po operatorze

## Rozszerzenie na inne miasta

Aby dodać inne miasto, wystarczy zmienić w `js/app.js`:

```javascript
const App = {
    config: {
        city: 'Warszawa',      // Zmień nazwę
        centerLat: 52.2297,    // Zmień współrzędne
        centerLng: 21.0122,
        zoom: 11
    }
};
```

System automatycznie znajdzie wszystkie stacje dla tego miasta w danych!

## Statystyki (całość danych)

- **Pul/baz**: 5027
- **Stacji**: 6086
- **Punktów ładowania**: 12041
- **Operatorów**: 700
- **Miast**: Setki w całej Polsce

*Dla Łodzi: konkretna liczba zostanie ustalona po uruchomieniu aplikacji*

---

**Gotowy do przetworzenia i wyświetlenia!** 🚀

