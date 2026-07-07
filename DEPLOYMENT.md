# Deployment auf GitHub Pages

Diese Anleitung zeigt, wie Sie die Web-Version auf GitHub Pages kostenlos online verfügbar machen.

## Voraussetzungen

- GitHub Account (kostenlos auf github.com erstellen)
- Git installiert auf Ihrem Computer

## Schritt-für-Schritt-Anleitung

### 1. GitHub Repository erstellen

1. Gehen Sie zu github.com und melden Sie sich an
2. Klicken Sie auf "+" (oben rechts) → "New repository"
3. Repository-Name: `ernaehrung-auf-its` (oder einen anderen Namen)
4. Setzen Sie das Repository auf **Public** (für kostenlose GitHub Pages)
5. Klicken Sie auf "Create repository"

### 2. Lokales Repository mit GitHub verbinden

Öffnen Sie das Terminal und führen Sie folgende Befehle aus:

```bash
cd "/Users/bjoern/Documents/Claude Code/parenterale-ernaehrung"

# Fügen Sie Ihre GitHub Repository-URL hinzu (ersetzen Sie USERNAME)
git remote add origin https://github.com/USERNAME/ernaehrung-auf-its.git

# Erstellen Sie den ersten Commit
git add .
git commit -m "Initial commit: Parenterale Ernährung Kalkulator"

# Pushen Sie zum GitHub Repository
git branch -M main
git push -u origin main
```

### 3. GitHub Pages aktivieren

1. Gehen Sie zu Ihrem Repository auf GitHub
2. Klicken Sie auf "Settings" (oben rechts)
3. Scrollen Sie zu "Pages" (im linken Menü)
4. Bei "Source": Wählen Sie "main" branch und "/web" folder
5. Klicken Sie auf "Save"

Nach ca. 1-2 Minuten ist Ihre Anwendung online verfügbar unter:
```
https://USERNAME.github.io/ernaehrung-auf-its/
```

## Alternative: Direkter Deployment aus /web Ordner

Falls die automatische Konfiguration nicht funktioniert:

1. In GitHub Repository Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: "main" und Folder: "/web"
4. Save

## Updates veröffentlichen

Wenn Sie Änderungen vornehmen:

```bash
cd "/Users/bjoern/Documents/Claude Code/parenterale-ernaehrung"

git add .
git commit -m "Beschreibung der Änderung"
git push
```

Die Änderungen werden automatisch auf GitHub Pages aktualisiert (ca. 1-2 Minuten).

## Troubleshooting

### Seite lädt nicht / 404 Fehler
- Überprüfen Sie, dass der Branch "main" und der Folder "/web" korrekt eingestellt sind
- Warten Sie 2-3 Minuten nach dem ersten Push
- Prüfen Sie, dass index.html im /web Ordner existiert

### CSS/JS lädt nicht
- Überprüfen Sie die Pfade in index.html (sollten relativ sein: `styles.css` statt `/styles.css`)

### CSV-Import funktioniert nicht
- Der CSV-Import sollte im Browser funktionieren
- Testen Sie mit einer kleinen Test-CSV-Datei
- Prüfen Sie die Browser-Konsole (F12) auf Fehler

## Kosten

GitHub Pages ist **komplett kostenlos** für öffentliche Repositories.

## Sicherheit

- Die Anwendung läuft vollständig im Browser des Nutzers
- Keine Daten werden an Server gesendet
- Alle Daten werden nur lokal im Browser gespeichert (LocalStorage)
- Ideal für medizinische Anwendungen mit sensiblen Daten
