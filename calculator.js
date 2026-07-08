// Berechnungs-Engine für parenterale Ernährung

class NutritionCalculator {
  constructor() {
    // Default-Formeln
    this.formulas = {
      ibw: {
        formula: '48.4 + 77.0 * (height - 1.50)',
        description: 'Ideales Körpergewicht (IBW)',
        variables: ['height']
      },
      abw: {
        formula: '0.25 * (weight - ibw) + ibw',
        description: 'Adjustiertes Körpergewicht (ABW)',
        variables: ['weight', 'ibw']
      },
      // Kalorienziel Aggression
      caloriesAggression: {
        bmiUnder30: {
          day1to3: { formula: '18 * weight', description: 'Tag 1-3, BMI ≤30' },
          day4plus: { formula: '24 * weight', description: 'Ab Tag 4, BMI ≤30' }
        },
        bmi30to50: {
          day1to3: { formula: '0.75 * 12 * weight', description: 'Tag 1-3, BMI 30-50' },
          day4plus: { formula: '12 * weight', description: 'Ab Tag 4, BMI 30-50' }
        },
        bmiOver50: {
          day1to3: { formula: '0.75 * 24 * ibw', description: 'Tag 1-3, BMI >50' },
          day4plus: { formula: '24 * ibw', description: 'Ab Tag 4, BMI >50' }
        }
      },
      // Kalorienziel Postaggression
      caloriesPostaggression: {
        bmiUnder30: {
          formula: '32 * weight',
          description: 'Postaggression, BMI <30'
        },
        bmiOver30: {
          formula: 'manual',
          description: 'Manuelle Eingabe bei BMI >30'
        }
      },
      // Aminosäureziel
      aminoAcids: {
        bmiUnder30: {
          day1to3: { formula: '0.75 * 1.2 * weight', description: 'Tag 1-3, BMI ≤30' },
          day4plus: { formula: '1.2 * weight', description: 'Ab Tag 4, BMI ≤30' }
        },
        bmiOver30: {
          day1to3: { formula: '0.75 * 1.8 * ibw', description: 'Tag 1-3, BMI >30' },
          day4plus: { formula: '1.8 * ibw', description: 'Ab Tag 4, BMI >30' }
        }
      },
      // Proteinziel
      protein: {
        aggression: {
          bmiUnder30: {
            day1to3: { formula: '0.75 * 1.0 * weight', description: 'Tag 1-3, BMI <30' },
            day4plus: { formula: '1.0 * weight', description: 'Ab Tag 4, BMI <30' }
          },
          bmiOver30: {
            day1to3: { formula: '0.75 * 1.5 * ibw', description: 'Tag 1-3, BMI >30' },
            day4plus: { formula: '1.5 * ibw', description: 'Ab Tag 4, BMI >30' }
          }
        },
        postaggression: {
          bmiUnder30: { formula: '1.0 * weight', description: 'Postaggression, BMI <30' },
          bmiOver30: { formula: '1.5 * ibw', description: 'Postaggression, BMI >30' }
        }
      },
      // CVVHD-Zuschläge
      cvvhd: {
        aminoAcids: { formula: '0.6 * 24', description: 'CVVHD Aminosäure-Zuschlag' },
        protein: { formula: '0.5 * 24', description: 'CVVHD Protein-Zuschlag' }
      }
    };
  }

  // BMI berechnen
  calculateBMI(weight, height) {
    return weight / (height * height);
  }

  // IBW berechnen
  calculateIBW(height) {
    return 48.4 + 77.0 * (height - 1.50);
  }

  // ABW berechnen
  calculateABW(weight, ibw) {
    return 0.25 * (weight - ibw) + ibw;
  }

  // Kalorienziel berechnen
  calculateCalorieGoal(weight, bmi, ibw, phase, day) {
    if (phase === 'aggression') {
      if (bmi <= 30) {
        return day <= 3 ? 18 * weight : 24 * weight;
      } else if (bmi <= 50) {
        return day <= 3 ? 0.75 * 12 * weight : 12 * weight;
      } else {
        return day <= 3 ? 0.75 * 24 * ibw : 24 * ibw;
      }
    } else if (phase === 'postaggression') {
      if (bmi < 30) {
        return 32 * weight;
      } else {
        return null; // Manuelle Eingabe erforderlich
      }
    }
    return 0;
  }

  // Aminosäureziel berechnen
  calculateAminoAcidGoal(weight, bmi, ibw, phase, day) {
    if (bmi <= 30) {
      // BMI ≤30: Tag 1-3 in Aggression 75% von 1.2*weight, sonst 1.2*weight
      if (phase === 'aggression' && day <= 3) {
        return 0.75 * 1.2 * weight;
      } else {
        return 1.2 * weight;
      }
    } else {
      // BMI >30: Tag 1-3 in Aggression 75% von 1.8*ibw, sonst 1.8*ibw
      if (phase === 'aggression' && day <= 3) {
        return 0.75 * 1.8 * ibw;
      } else {
        return 1.8 * ibw;
      }
    }
  }

  // Proteinziel berechnen
  calculateProteinGoal(weight, bmi, ibw, phase, day) {
    if (bmi < 30) {
      // BMI <30: 1 g/kg aktuelles Körpergewicht
      // Tag 1-3 Aggression: 75%, ab Tag 4 oder Postaggression: 100%
      if (phase === 'aggression' && day <= 3) {
        return 0.75 * 1.0 * weight;
      } else {
        return 1.0 * weight;
      }
    } else {
      // BMI >30: 1.5 g/kg Idealgewicht
      // Tag 1-3 Aggression: 75%, ab Tag 4 oder Postaggression: 100%
      if (phase === 'aggression' && day <= 3) {
        return 0.75 * 1.5 * ibw;
      } else {
        return 1.5 * ibw;
      }
    }
  }

  // CVVHD-Zuschlag für Aminosäuren
  calculateCVVHDAminoAcidAddition() {
    return 0.6 * 24; // 0.6 g/h * 24h = 14.4 g
  }

  // CVVHD-Zuschlag für Protein
  calculateCVVHDProteinAddition() {
    return 0.5 * 24; // 0.5 g/h * 24h = 12 g
  }

  // Evaluiert eine Formel mit gegebenen Variablen
  evaluateFormula(formulaString, variables) {
    try {
      // Ersetze Variablennamen durch ihre Werte
      let formula = formulaString;
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(key, 'g');
        formula = formula.replace(regex, value);
      }

      // Evaluiere die Formel (sichere Evaluation mit begrenztem Scope)
      return Function('"use strict"; return (' + formula + ')')();
    } catch (error) {
      console.error('Fehler beim Evaluieren der Formel:', error);
      return null;
    }
  }

  // Formel aktualisieren
  updateFormula(path, newFormula) {
    const keys = path.split('.');
    let target = this.formulas;

    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]];
    }

    if (typeof target[keys[keys.length - 1]] === 'object') {
      target[keys[keys.length - 1]].formula = newFormula;
    } else {
      target[keys[keys.length - 1]] = newFormula;
    }
  }

  // Formeln exportieren
  exportFormulas() {
    return JSON.stringify(this.formulas, null, 2);
  }

  // Formeln importieren
  importFormulas(formulasJSON) {
    try {
      this.formulas = JSON.parse(formulasJSON);
      return true;
    } catch (error) {
      console.error('Fehler beim Importieren der Formeln:', error);
      return false;
    }
  }
}

// CSV-Parser für Infusionslösungen
class InfusionSolutionManager {
  constructor() {
    // Umrechnungsfaktor: Protein zu Aminosäuren
    // Standard-Umrechnung: Proteingehalt × 1.2 = Aminosäuregehalt
    // bzw. Aminosäuregehalt ÷ 1.2 = Proteingehalt
    this.proteinToAminoAcidFactor = 1.2;

    // Default-Lösungen (aus loesungen.csv)
    this.solutions = [
      {
        name: 'Fresubin HP Energy',
        kcalPerMl: 1.50,
        proteinPerMl: 0.075,
        aminoAcidsPerMl: 0,
        fatPerMl: 0.058,
        carbohydratesPerMl: 0.17
      },
      {
        name: 'Fresubin Original',
        kcalPerMl: 1.00,
        proteinPerMl: 0.038,
        aminoAcidsPerMl: 0,
        fatPerMl: 0.033,
        carbohydratesPerMl: 0.14
      },
      {
        name: 'Survimed OPD',
        kcalPerMl: 1.01,
        proteinPerMl: 0.045,
        aminoAcidsPerMl: 0,
        fatPerMl: 0.028,
        carbohydratesPerMl: 0.143
      },
      {
        name: 'Survimed OPD HN',
        kcalPerMl: 1.33,
        proteinPerMl: 0.067,
        aminoAcidsPerMl: 0,
        fatPerMl: 0.037,
        carbohydratesPerMl: 0.183
      },
      {
        name: 'SMOFlipid 20%',
        kcalPerMl: 2.00,
        proteinPerMl: 0,
        aminoAcidsPerMl: 0,
        fatPerMl: 0.20,
        carbohydratesPerMl: 0
      },
      {
        name: 'Propofol 2% MCT',
        kcalPerMl: 1.1,
        proteinPerMl: 0,
        aminoAcidsPerMl: 0,
        fatPerMl: 0.10,
        carbohydratesPerMl: 0
      },
      {
        name: 'Glucose 20%',
        kcalPerMl: 0.80,
        proteinPerMl: 0,
        aminoAcidsPerMl: 0,
        fatPerMl: 0,
        carbohydratesPerMl: 0.20
      },
      {
        name: 'Glucose 40%',
        kcalPerMl: 1.60,
        proteinPerMl: 0,
        aminoAcidsPerMl: 0,
        fatPerMl: 0,
        carbohydratesPerMl: 0.40
      },
      {
        name: 'Aminoplasmal 10%',
        kcalPerMl: 0.40,
        proteinPerMl: 0,
        aminoAcidsPerMl: 0.10,
        fatPerMl: 0,
        carbohydratesPerMl: 0
      },
      {
        name: 'SmofKabiven zentral',
        kcalPerMl: 1.10,
        proteinPerMl: 0,
        aminoAcidsPerMl: 0.051,
        fatPerMl: 0.038,
        carbohydratesPerMl: 0.127
      }
    ];
  }

  // CSV parsen
  parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    this.solutions = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());

      const solution = {
        name: values[0],
        kcalPerMl: parseFloat(values[1]) || 0,
        proteinPerMl: parseFloat(values[2]) || 0,
        aminoAcidsPerMl: parseFloat(values[3]) || 0,
        fatPerMl: parseFloat(values[4]) || 0,
        carbohydratesPerMl: parseFloat(values[5]) || 0
      };

      this.solutions.push(solution);
    }

    return this.solutions;
  }

  // Lösung finden
  findSolution(name) {
    return this.solutions.find(s => s.name.toLowerCase() === name.toLowerCase());
  }

  // Alle Lösungen abrufen
  getAllSolutions() {
    return this.solutions;
  }

  // Lösung manuell hinzufügen
  addSolution(solution) {
    this.solutions.push(solution);
  }

  // Protein zu Aminosäuren umrechnen
  proteinToAminoAcids(proteinGrams) {
    return proteinGrams * this.proteinToAminoAcidFactor;
  }

  // Aminosäuren zu Protein umrechnen
  aminoAcidsToProtein(aminoAcidsGrams) {
    return aminoAcidsGrams / this.proteinToAminoAcidFactor;
  }

  // Gesamte "Protein-Äquivalenz" einer Lösung berechnen (Protein + Aminosäuren in Protein-Einheiten)
  getTotalProteinEquivalent(solution, ml) {
    const proteinFromProtein = solution.proteinPerMl * ml;
    const proteinFromAminoAcids = this.aminoAcidsToProtein(solution.aminoAcidsPerMl * ml);
    return proteinFromProtein + proteinFromAminoAcids;
  }

  // Gesamte "Aminosäure-Äquivalenz" einer Lösung berechnen (Protein + Aminosäuren in AS-Einheiten)
  getTotalAminoAcidEquivalent(solution, ml) {
    const aminoFromAminoAcids = solution.aminoAcidsPerMl * ml;
    const aminoFromProtein = this.proteinToAminoAcids(solution.proteinPerMl * ml);
    return aminoFromAminoAcids + aminoFromProtein;
  }
}

// Laufraten-Berechner
class InfusionRateCalculator {
  constructor(solutionManager) {
    this.solutionManager = solutionManager;
  }

  // Aktuelle Nährstoffaufnahme berechnen
  calculateCurrentIntake(runningSolutions) {
    let totalCalories = 0;
    let totalAminoAcids = 0;
    let totalProtein = 0;

    for (const running of runningSolutions) {
      const solution = this.solutionManager.findSolution(running.name);
      if (solution) {
        const mlPerDay = running.ratePerHour * 24;
        totalCalories += solution.kcalPerMl * mlPerDay;
        totalAminoAcids += this.solutionManager.getTotalAminoAcidEquivalent(solution, mlPerDay);
        totalProtein += this.solutionManager.getTotalProteinEquivalent(solution, mlPerDay);
      }
    }

    return { calories: totalCalories, aminoAcids: totalAminoAcids, protein: totalProtein };
  }

  // Prüft ob eine Lösung eine Mischlösung ist (enthält sowohl KH als auch Fett)
  isMixedSolution(solution) {
    return solution.carbohydratesPerMl > 0 && solution.fatPerMl > 0;
  }

  // Prüft ob alle geplanten Lösungen Einzelkomponenten sind
  areAllSingleComponents(plannedSolutions) {
    for (const name of plannedSolutions) {
      const solution = this.solutionManager.findSolution(name);
      if (!solution) continue;
      if (this.isMixedSolution(solution)) {
        return false;
      }
    }
    return true;
  }

  // Erforderliche Laufraten berechnen
  calculateRequiredRates(targetCalories, targetAminoAcids, targetProtein, runningSolutions, plannedSolutions, carbRatio = 70, fatRatio = 30, ignoreAminoGoal = false, ignoreProteinGoal = false) {
    // Berechne aktuelle Aufnahme
    const currentIntake = this.calculateCurrentIntake(runningSolutions);

    // Berechne verbleibenden Bedarf
    const remainingCalories = Math.max(0, targetCalories - currentIntake.calories);
    const remainingAminoAcids = ignoreAminoGoal ? 0 : Math.max(0, targetAminoAcids - currentIntake.aminoAcids);
    const remainingProtein = ignoreProteinGoal ? 0 : Math.max(0, targetProtein - currentIntake.protein);

    // Wenn nur eine geplante Lösung: einfache Berechnung
    if (plannedSolutions.length === 1) {
      const solution = this.solutionManager.findSolution(plannedSolutions[0]);
      if (!solution) return null;

      const rateForCalories = remainingCalories / (solution.kcalPerMl * 24);

      // Berechne benötigte Rate für Aminosäuren (umgerechnet auf AS-Äquivalent)
      const aminoEquivPerMl = this.solutionManager.getTotalAminoAcidEquivalent(solution, 1);
      const rateForAminoAcids = aminoEquivPerMl > 0 ? remainingAminoAcids / (aminoEquivPerMl * 24) : 0;

      // Berechne benötigte Rate für Protein (umgerechnet auf Protein-Äquivalent)
      const proteinEquivPerMl = this.solutionManager.getTotalProteinEquivalent(solution, 1);
      const rateForProtein = proteinEquivPerMl > 0 ? remainingProtein / (proteinEquivPerMl * 24) : 0;

      // Nimm die höchste Rate (limitierender Faktor)
      const rates = [
        { rate: rateForCalories, factor: 'Kalorien' },
        { rate: rateForAminoAcids, factor: 'Aminosäuren' },
        { rate: rateForProtein, factor: 'Protein' }
      ];
      const maxRate = rates.reduce((max, curr) => curr.rate > max.rate ? curr : max);

      return [{
        name: plannedSolutions[0],
        ratePerHour: maxRate.rate,
        mlPerDay: maxRate.rate * 24,
        limitingFactor: maxRate.factor
      }];
    }

    // Wenn zwei geplante Lösungen: Gleichungssystem lösen
    if (plannedSolutions.length === 2) {
      const sol1 = this.solutionManager.findSolution(plannedSolutions[0]);
      const sol2 = this.solutionManager.findSolution(plannedSolutions[1]);

      if (!sol1 || !sol2) return null;

      // Gleichungssystem:
      // sol1.kcalPerMl * rate1 * 24 + sol2.kcalPerMl * rate2 * 24 = remainingCalories
      // Für Protein/AS: verwende Äquivalente (kombiniert Protein + Aminosäuren)

      const a11 = sol1.kcalPerMl * 24;
      const a12 = sol2.kcalPerMl * 24;
      const b1 = remainingCalories;

      // Bestimme welches Ziel verwendet werden soll (AS oder Protein)
      // Wenn beide Ziele aktiv sind, bevorzuge Aminosäuren, wenn mindestens eine Lösung AS hat
      let useAminoAcids = !ignoreAminoGoal;
      let useProtein = !ignoreProteinGoal;

      const sol1HasAmino = sol1.aminoAcidsPerMl > 0;
      const sol2HasAmino = sol2.aminoAcidsPerMl > 0;
      const sol1HasProtein = sol1.proteinPerMl > 0;
      const sol2HasProtein = sol2.proteinPerMl > 0;

      let a21, a22, b2;

      if (useAminoAcids && (sol1HasAmino || sol2HasAmino || sol1HasProtein || sol2HasProtein)) {
        // Verwende Aminosäure-Äquivalente (Protein wird zu AS konvertiert)
        a21 = this.solutionManager.getTotalAminoAcidEquivalent(sol1, 1) * 24;
        a22 = this.solutionManager.getTotalAminoAcidEquivalent(sol2, 1) * 24;
        b2 = remainingAminoAcids;
      } else if (useProtein && (sol1HasProtein || sol2HasProtein || sol1HasAmino || sol2HasAmino)) {
        // Verwende Protein-Äquivalente (AS wird zu Protein konvertiert)
        a21 = this.solutionManager.getTotalProteinEquivalent(sol1, 1) * 24;
        a22 = this.solutionManager.getTotalProteinEquivalent(sol2, 1) * 24;
        b2 = remainingProtein;
      } else {
        // Keine Protein/AS Ziele aktiv - verwende nur Kalorien
        a21 = 0;
        a22 = 0;
        b2 = 0;
      }

      // Cramer's Rule
      const det = a11 * a22 - a12 * a21;

      if (Math.abs(det) < 0.0001) {
        // Determinante zu klein - Lösungen sind linear abhängig
        return null;
      }

      const rate1 = (b1 * a22 - b2 * a12) / det;
      const rate2 = (a11 * b2 - a21 * b1) / det;

      return [
        {
          name: plannedSolutions[0],
          ratePerHour: Math.max(0, rate1),
          mlPerDay: Math.max(0, rate1) * 24
        },
        {
          name: plannedSolutions[1],
          ratePerHour: Math.max(0, rate2),
          mlPerDay: Math.max(0, rate2) * 24
        }
      ];
    }

    // Wenn drei geplante Lösungen: Einzelkomponenten-Ernährung
    if (plannedSolutions.length === 3) {
      const sol1 = this.solutionManager.findSolution(plannedSolutions[0]);
      const sol2 = this.solutionManager.findSolution(plannedSolutions[1]);
      const sol3 = this.solutionManager.findSolution(plannedSolutions[2]);

      if (!sol1 || !sol2 || !sol3) return null;

      // Prüfe ob alle Einzelkomponenten sind
      if (!this.areAllSingleComponents(plannedSolutions)) {
        alert('Bei 3 Lösungen müssen alle Einzelkomponenten sein (keine Mischlösungen). Die Makronährstoff-Verteilung kann sonst nicht eingehalten werden.');
        return null;
      }

      // Verwende das höhere der beiden Ziele (AS oder Protein) für Protein-Kalorien
      let proteinAminoGrams = 0;
      if (!ignoreAminoGoal && remainingAminoAcids > 0) {
        proteinAminoGrams = Math.max(proteinAminoGrams, remainingAminoAcids);
      }
      if (!ignoreProteinGoal && remainingProtein > 0) {
        // Konvertiere Protein zu Aminosäure-Äquivalent für einheitliche Berechnung
        proteinAminoGrams = Math.max(proteinAminoGrams, this.solutionManager.proteinToAminoAcids(remainingProtein));
      }

      // Kalorien aus Aminosäuren/Protein subtrahieren (1g AS/Protein = 4 kcal)
      const remainingNonProteinCalories = remainingCalories - (proteinAminoGrams * 4);

      // Berechne Kalorien nach Verteilung
      const carbCalories = remainingNonProteinCalories * (carbRatio / 100);
      const fatCalories = remainingNonProteinCalories * (fatRatio / 100);

      // Finde welche Lösung welcher Makronährstoff ist
      let proteinSol = null, carbSol = null, fatSol = null;
      let proteinIndex = -1, carbIndex = -1, fatIndex = -1;

      for (let i = 0; i < 3; i++) {
        const sol = [sol1, sol2, sol3][i];
        const name = plannedSolutions[i];

        // Protein/Aminosäure-Lösung: hohe AS oder Protein, kein KH/Fett
        if ((sol.aminoAcidsPerMl > 0 || sol.proteinPerMl > 0) && sol.carbohydratesPerMl === 0 && sol.fatPerMl === 0) {
          proteinSol = sol;
          proteinIndex = i;
        }
        // Kohlenhydrat-Lösung: hohe KH, kein Fett
        else if (sol.carbohydratesPerMl > 0 && sol.fatPerMl === 0) {
          carbSol = sol;
          carbIndex = i;
        }
        // Fett-Lösung: hohes Fett, keine KH
        else if (sol.fatPerMl > 0 && sol.carbohydratesPerMl === 0) {
          fatSol = sol;
          fatIndex = i;
        }
      }

      if (!proteinSol || !carbSol || !fatSol) {
        alert('Für 3-Komponenten-Ernährung benötigen Sie: 1 Protein/Aminosäure-Lösung, 1 Kohlenhydrat-Lösung, 1 Fett-Lösung.');
        return null;
      }

      // Berechne Raten
      // Protein/Aminosäure: nach Bedarf (verwende Aminosäure-Äquivalent)
      const proteinAminoEquivPerMl = this.solutionManager.getTotalAminoAcidEquivalent(proteinSol, 1);
      const proteinRate = proteinAminoEquivPerMl > 0 ? proteinAminoGrams / (proteinAminoEquivPerMl * 24) : 0;

      // Kohlenhydrate: nach Kalorien (1g KH = 4 kcal)
      const carbGrams = carbCalories / 4;
      const carbRate = carbGrams / (carbSol.carbohydratesPerMl * 24);

      // Fett: nach Kalorien (1g Fett = 9 kcal)
      const fatGrams = fatCalories / 9;
      const fatRate = fatGrams / (fatSol.fatPerMl * 24);

      const results = [null, null, null];
      results[proteinIndex] = {
        name: plannedSolutions[proteinIndex],
        ratePerHour: Math.max(0, proteinRate),
        mlPerDay: Math.max(0, proteinRate) * 24,
        component: 'Protein/Aminosäuren'
      };
      results[carbIndex] = {
        name: plannedSolutions[carbIndex],
        ratePerHour: Math.max(0, carbRate),
        mlPerDay: Math.max(0, carbRate) * 24,
        component: 'Kohlenhydrate'
      };
      results[fatIndex] = {
        name: plannedSolutions[fatIndex],
        ratePerHour: Math.max(0, fatRate),
        mlPerDay: Math.max(0, fatRate) * 24,
        component: 'Fett'
      };

      return results;
    }

    return null;
  }
}
