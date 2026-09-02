# Ernährung auf ITS - Infusionsraten-Kalkulator

Version 1.1 (Versionshinweise - siehe unten)

## <span style="color: red;">WICHTIG !</span>

**Diese Website ist ein Hilfsmittel für die Berechnung der unten aufgeführten Parameter.**
**Dabei integriert sie weder medizinische Kenntnisse, noch gesunden Menschenverstand!**
**Hinterfragt werden sollte bei jeder Anwendung (wie auch bei jeder Verordnung von Ernährung ohne Verwendung dieses Hilfsmittels) mindestens:**
- erscheinen die errechneten Ziele sinnvoll 
- sind die Ziele in Anbetracht der klinischen Situation umsetzbar oder evtl. schädlich (Volumen, Appetit, Kostaufbau, etc.)
- gibt es Einflussfaktoren, die hier nicht berücksichtigt werden (bspw. Leberzirrhose, Serum-Triglyzeridkonzentration, Harnstoff/Kreatinin-Dynamik)

## Überblick

Diese Anwendung unterstützt bei der Berechnung von:
- **Kalorienzielen** basierend auf Stoffwechsellage (Aggression/Postaggression)
- **Protein- und Aminosäurezielen** mit CVVHD-Unterstützung
- **Infusionsraten** für 1-3 geplante Lösungen
- **Indirekte Kalorimetrie** mittels VCO₂-Messung

Grundlage der Berechnungen sind die Empfehlungen der DGEM Leitlinie "Klinische Ernährung in der Intensivmedizin". Die Empfehlungen sind mangels Studien im Bereich von BMI >30 kg/m<sup>2</sup> lückenhaft. In diesem Bereich wurden Empfehlungen anderer Fachgesellschaften (ESPEN, ASPEN) mit den Erwägungen der DGEM integriert und pragmatische Lösungen eingesetzt.
Im Tab "Formeln" können alle im Kalkulator angewandten Formeln eingesehen und angepasst werden. 

## Schnellstart

1. **Patientendaten eingeben**: Körpergewicht, Körpergröße, Stoffwechsellage
2. **Berechnen**: Automatische Ermittlung von BMI, IBW, ABW und Zielwerten
3. **Infusionen konfigurieren**: Laufende und geplante Infusionen hinzufügen
4. **Laufraten berechnen**: Erforderliche ml/h zur Zielerreichung

## Besondere Merkmale

### BMI-Stratifizierung
Die Anwendung berücksichtigt unterschiedliche BMI-Bereiche:
- **BMI ≤30**: Standard-Formeln
- **BMI >30 (mit Absicherung)**: Absicherung gegen Kalorienabfall unterhalb das Ziel der Standard-Formeln für BMI = 30
- **BMI >30 (ohne Absicherung)**: integrierte Formeln der o.g. Leitlinien für BMI 30-50 und BMI >50

### Stoffwechselphasen
- **Aggression (Tag 1-3)**: Reduzierte Ziele (75% der Standardziele)
- **Aggression (ab Tag 4)**: Vollständige Ziele
- **Postaggression**: Erhöhte Ziele für Anabolismus

### CVVHD-Kompensation
Automatische Zuschläge bei kontinuierlicher Nierenersatztherapie:
- +14,4 g/Tag Aminosäuren
- +12,0 g/Tag Protein

### 3-Komponenten-Ernährung
Unterstützung für bis zu 3 geplante Infusionen mit:
- Flexiblen Kohlenhydrat:Fett-Verhältnissen
- Automatischer Komponentenerkennung
- Validierung der Lösungstypen

## Formeln anpassen

Im Tab "Formeln" können Sie alle Berechnungsformeln an Ihre klinischen Standards anpassen.

**Verfügbare Variablen:**
- `weight`: Körpergewicht in kg
- `height`: Körpergröße in m
- `bmi`: Body Mass Index
- `ibw`: Ideales Körpergewicht
- `abw`: Adjustiertes Körpergewicht

## Indirekte Kalorimetrie

Berechnen Sie den tatsächlichen Energieverbrauch mittels:
1. **VCO₂-Eingabe**: Wert vom Beatmungsgerät (ml/min)
2. **RQ-Berechnung**: Basierend auf aktueller Nährstoffzusammensetzung
3. **REE-Berechnung**: Weir-Formel für Ruheenergieumsatz

## Wichtige Hinweise

⚠️ Diese Anwendung dient als Entscheidungshilfe. Die finale klinische Entscheidung liegt beim behandelnden Arzt / der behandelnden Ärztin.

---

**Version**: 1.1<br>
**Letztes Update**: 02.09.2026<br>
**Hinweise / Fehlermeldungen an**: bjoern.dahncke@ukdd.de

---

Patch Notes:
v1.1: 
- Bei unmöglicher Lösung des Gleichungssystems aufgrund unpassender Infusionslösungen wurden teilweise negative Laufraten berechnet und dann auf 0 gesetzt. Diese wurden zwar auf 0 gesetzt und als 0 mL/h angezeigt, allerdings im Hintergrund mit der anderen Infusionslösung trotzdem verrechnet, sodass es zu nicht nachvollziehbaren Diskrepanzen in verschiedenen Szenarien kam. 
Wenn 2 Lösungen angesetzt werden, mit welchen die errechneten Ziele nicht erfüllt werden können, dann wird nun per Default das Aminosäure/Proteinziel ignoriert. 
- Es wurden Schalter eingepflegt, mit welchen die o.g. Priorisierung bei unmöglicher Erfüllung der Ziele mit den vorgegebenen Lösungen angepasst werden kann. (Kalorienziel vs Protein-/Aminosäureziel)
- Im Bereich "Zielwerte" sind nun unterhalb der Tagesziele auch die Tagesziele pro kg KG aufgeführt und können (ebenso wie die Tagesziele) manuell geändert werden. Der Update button aktualisiert die jeweils abhängigen Felder. Die manuelle Änderung der Ziele wird bei der Laufraten-Berechnung berücksichtigt. 
- Die Körpergröße kann nun in cm oder in m eingegeben werden. Bei Eingabe einer Zahl >3.0 wird von einer Eingabe in cm ausgegangen. 
