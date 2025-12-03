# 🚀 Deploy na GitHub Pages - Instrukcja

## Krok 1: Inicjalizuj Git Repository

```bash
cd /Users/kacper/Documents/AutaElektryczne

# Inicjalizuj git
git init

# Dodaj wszystkie pliki
git add .

# Pierwszy commit
git commit -m "Initial commit - EV Charging Stations Map for Łódź"
```

## Krok 2: Stwórz Repository na GitHub

1. Idź na https://github.com
2. Kliknij **New repository**
3. Nazwa: `ev-charging-lodz` (lub dowolna inna)
4. Opis: "Interaktywna mapa stacji ładowania pojazdów elektrycznych w Łodzi"
5. **Public** (ważne dla GitHub Pages free)
6. **NIE** zaznaczaj "Initialize with README" (już masz pliki)
7. Kliknij **Create repository**

## Krok 3: Push do GitHub

```bash
# Dodaj remote (ZMIEŃ NA TWÓJ URL!)
git remote add origin https://github.com/TWOJ-USERNAME/ev-charging-lodz.git

# Ustaw main jako główny branch
git branch -M main

# Push
git push -u origin main
```

## Krok 4: Aktywuj GitHub Pages

1. W swoim repo na GitHub, kliknij **Settings** (Ustawienia)
2. W menu bocznym znajdź **Pages**
3. W sekcji **Source**:
   - Branch: `main`
   - Folder: `/ (root)`
4. Kliknij **Save**

## Krok 5: Poczekaj na deployment (1-2 minuty)

GitHub automatycznie zbuduje i opublikuje Twoją stronę.

Twoja aplikacja będzie dostępna pod adresem:
```
https://TWOJ-USERNAME.github.io/ev-charging-lodz/
```

## ✅ Sprawdź czy działa

Po 1-2 minutach:
1. Otwórz URL: `https://TWOJ-USERNAME.github.io/ev-charging-lodz/`
2. Powinna załadować się mapa Łodzi ze stacjami ładowania
3. Sprawdź czy:
   - Mapa się wyświetla
   - Markery są widoczne
   - Kliknięcie markera pokazuje popup
   - Filtry działają

## 🔧 Troubleshooting

### Problem: 404 Not Found
**Rozwiązanie**: 
- Poczekaj 2-3 minuty (GitHub Pages potrzebuje czasu)
- Sprawdź czy w Settings > Pages widzisz zielony komunikat "Your site is published"

### Problem: Biała strona
**Rozwiązanie**:
- Otwórz Console przeglądarki (F12)
- Sprawdź czy są błędy ładowania JSON
- Upewnij się że wszystkie pliki zostały spushowane do repozytorium

### Problem: Błędy CORS
**Rozwiązanie**:
- GitHub Pages nie ma problemów z CORS dla statycznych plików
- Jeśli problem występuje lokalnie, użyj serwera HTTP (nie otwieraj `file:///`)

## 📝 Aktualizacja aplikacji

Gdy wprowadzisz zmiany:

```bash
# Dodaj zmienione pliki
git add .

# Commit ze znaczącym opisem
git commit -m "Feature: Dodano geolokalizację użytkownika"

# Push do GitHub
git push

# GitHub Pages automatycznie zaktualizuje stronę (1-2 min)
```

## 🌐 Custom Domain (opcjonalnie)

Jeśli chcesz własną domenę (np. `ev-lodz.pl`):

1. Kup domenę (np. na Namecheap, GoDaddy)
2. W ustawieniach domeny dodaj DNS record:
   ```
   Type: CNAME
   Host: www
   Value: TWOJ-USERNAME.github.io
   ```
3. W repo GitHub Settings > Pages > Custom domain wpisz `www.ev-lodz.pl`
4. Zaznacz "Enforce HTTPS"

## 🎉 Gotowe!

Twoja aplikacja jest teraz dostępna publicznie w internecie!

**Następne kroki:**
1. Dodaj link do README.md
2. Stwórz screenshot aplikacji
3. Udostępnij link znajomym / jury hackathonu
4. Tweet o projekcie z #hackathon #EV #OpenData

## 📊 Statystyki GitHub Pages

GitHub Pages oferuje:
- ✅ Darmowy hosting
- ✅ HTTPS automatycznie
- ✅ CDN (szybkie ładowanie globalnie)
- ✅ Unlimited bandwidth dla małych projektów
- ✅ Custom domain support

## ⚠️ Limity GitHub Pages

- Max 1 GB rozmiaru repo
- Max 100 GB transfer/miesiąc (wystarczy dla tysięcy użytkowników)
- Build time: ~1-2 minuty
- Tylko statyczne strony (HTML/CSS/JS)

---

**Powodzenia! 🚀**

_Jeśli masz pytania, otwórz issue na GitHubie lub sprawdź [dokumentację GitHub Pages](https://docs.github.com/pages)_

