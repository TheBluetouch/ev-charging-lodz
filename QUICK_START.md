# ⚡ QUICK START - Start w 15 minut!

Ten przewodnik pomoże Ci uruchomić aplikację w ekspresowym tempie.

## 📋 Przed startem

**Co już masz**:
- ✅ Pliki JSON z danymi stacji
- ✅ Plan projektu (PLAN_PROJEKTU.md)
- ✅ Szczegółowe instrukcje (INSTRUKCJE_SONNET.md)

**Co musisz zrobić**:
- ⬜ Stworzyć strukturę HTML/CSS/JS
- ⬜ Zaimplementować przetwarzanie danych
- ⬜ Dodać mapę i markery
- ⬜ Uruchomić lokalnie

---

## 🎯 Ścieżka krytyczna (MVP w 6h)

### FAZA 1: Setup (30 min)
1. Skopiuj kod z `INSTRUKCJE_SONNET.md`:
   - Krok 1.2: `index.html`
   - Krok 1.3: `css/style.css`
2. Stwórz katalogi: `js/`, `assets/icons/`

### FAZA 2: JavaScript (3h)
3. Skopiuj kod z `INSTRUKCJE_SONNET.md`:
   - Krok 2.1: `js/dataProcessor.js`
   - Krok 3.1: `js/mapManager.js`
   - Krok 4.1: `js/filters.js`
   - Krok 5.1: `js/app.js`

### FAZA 3: Test (30 min)
4. Uruchom lokalny serwer:
   ```bash
   python3 -m http.server 8000
   ```
5. Otwórz: `http://localhost:8000`
6. Sprawdź czy wszystko działa

### FAZA 4: Tweaks (1.5h)
7. Popraw błędy (jeśli są)
8. Testuj filtry
9. Testuj responsywność

### FAZA 5: Deploy (30 min)
10. Push do GitHub
11. Enable GitHub Pages
12. Gotowe!

---

## 🚀 Jeszcze szybciej - Copy-Paste Mode

Jeśli chcesz najszybciej jak się da:

### 1. Stwórz pliki (2 min)
```bash
cd /Users/kacper/Documents/AutaElektryczne
mkdir -p css js assets/icons
touch index.html css/style.css js/{app,dataProcessor,mapManager,filters}.js
```

### 2. Copy-paste kod (10 min)
Otwórz `INSTRUKCJE_SONNET.md` i skopiuj:
- Cały kod z Krok 1.2 → `index.html`
- Cały kod z Krok 1.3 → `css/style.css`
- Cały kod z Krok 2.1 → `js/dataProcessor.js`
- Cały kod z Krok 3.1 → `js/mapManager.js`
- Cały kod z Krok 4.1 → `js/filters.js`
- Cały kod z Krok 5.1 → `js/app.js`

### 3. Uruchom (1 min)
```bash
python3 -m http.server 8000
```

### 4. Testuj (2 min)
Otwórz `http://localhost:8000` i ciesz się!

---

## 🔍 Szybki Debug

### Problem: Mapa nie ładuje się
**Fix**: Sprawdź Console (F12) - prawdopodobnie błąd w ścieżce do JSON

### Problem: Brak markerów
**Fix**: Sprawdź czy `dane_baz.json` ma wpisy dla "Łódź"
```javascript
// W Console:
DataProcessor.cache.pools.filter(p => p.city === 'Łódź').length
```

### Problem: CORS error
**Fix**: Musisz użyć serwera HTTP, nie otwieraj `file:///`

---

## ✅ Checklist przed prezentacją

- [ ] Aplikacja działa lokalnie
- [ ] Widać stacje w Łodzi na mapie
- [ ] Popupy działają
- [ ] Przynajmniej 1 filtr działa
- [ ] Responsywne na mobile
- [ ] Deploy na live URL (GitHub Pages)

---

## 🎤 Prezentacja (5 min)

### Slajd 1: Problem (30 sek)
"Kierowcy EV w Łodzi nie wiedzą gdzie ładować"

### Slajd 2: Demo (3 min)
1. Pokaż mapę
2. Kliknij marker
3. Użyj filtru
4. Pokaż nawigację
5. Pokaż mobile

### Slajd 3: Tech (1 min)
"Leaflet.js + dane EIPA + Vanilla JS"

### Slajd 4: Przyszłość (30 sek)
"Więcej miast, real-time, mobile app"

---

## 💡 Pro Tips

1. **Commit często** - co 30 min do gita
2. **Test na bieżąco** - odświeżaj stronę co 15 min
3. **Console = twój przyjaciel** - zawsze otwarta (F12)
4. **Mobile first** - testuj na telefonie od początku
5. **Keep it simple** - MVP > perfekcja

---

## 🆘 Pomoc

Jeśli coś nie działa:
1. Sprawdź Console (F12) - 90% problemów widać tam
2. Sprawdź Network tab - czy JSON-y się ładują?
3. Sprawdź `INSTRUKCJE_SONNET.md` - sekcja Troubleshooting

---

## 📞 Kontakt na hackathonie

Jeśli potrzebujesz pomocy:
- Mentor hackathonu
- Slack/Discord kanał projektu
- Stack Overflow

---

**Good luck! Masz wszystko czego potrzebujesz. Teraz tylko wykonaj! 🚀**

---

## 📊 Timeline

```
0:00 - 0:30   Setup projektu
0:30 - 2:00   JavaScript - przetwarzanie danych
2:00 - 3:30   JavaScript - mapa i markery
3:30 - 4:30   JavaScript - filtry
4:30 - 5:00   JavaScript - app.js
5:00 - 5:30   Testowanie
5:30 - 6:00   Poprawki i deploy
```

**Po 6 godzinach masz działający MVP!**

Kolejne 6 godzin (jeśli masz czas):
- Ulepszenia UX
- Więcej filtrów
- Geolokalizacja
- Search bar
- Dark mode
- Dokumentacja

