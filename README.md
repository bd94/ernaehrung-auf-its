# Ernährung auf ITS - Infusionsraten-Kalkulator (Web-Version)

Eine Web-Anwendung zur Berechnung von Infusionsraten für parenterale und enterale Ernährung auf der Intensivstation.

## Online-Zugriff

Die Anwendung ist online verfügbar unter: [Ihre-GitHub-Pages-URL]

## Verwendung

### 1. CSV-Datei vorbereiten

Erstellen Sie eine CSV-Datei mit Ihren Infusionslösungen im folgenden Format:

```csv
Name,kcal/ml,Protein g/ml,Aminosäuren g/ml,Fett g/ml,KH g/ml
Propofol 2%,0.18,0,0,0.2,0
SMOF Kabiven,0.75,0.038,0.038,0.037,0.14
Aminoplasmal 10%,0.4,0,0.1,0,0
```

### 2. Lösungen importieren

1. Klicken Sie auf den Tab "Lösungen"
2. Klicken Sie auf "CSV importieren"
3. Wählen Sie Ihre CSV-Datei aus
4. Die Lösungen werden gespeichert und bleiben beim nächsten Besuch verfügbar

### 3. Patientendaten eingeben

1. Im Tab "Kalkulator": Geben Sie Körpergewicht, Körpergröße und Stoffwechsellage ein
2. Klicken Sie auf "Berechnen"
3. Passen Sie die Zielwerte bei Bedarf manuell an

### 4. Laufraten berechnen

1. Fügen Sie laufende Infusionen hinzu (falls vorhanden)
2. Fügen Sie geplante Infusionen hinzu (1-2 Lösungen)
3. Klicken Sie auf "Laufraten berechnen"

## Datenspeicherung

Alle Daten (Formeln und Lösungen) werden lokal im Browser gespeichert (LocalStorage). Die Daten bleiben erhalten, auch wenn Sie den Browser schließen.

## Browser-Kompatibilität

Die Anwendung funktioniert in allen modernen Browsern:
- Chrome/Edge (empfohlen)
- Firefox
- Safari

## Hinweise

- Keine Installation erforderlich
- Funktioniert auch offline (nach dem ersten Laden)
- Daten werden nur lokal gespeichert, nicht auf einem Server
