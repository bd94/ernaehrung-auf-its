// Hauptanwendung - Browser-Version (ohne Electron)
const calculator = new NutritionCalculator();
const solutionManager = new InfusionSolutionManager();
const rateCalculator = new InfusionRateCalculator(solutionManager);

let currentResults = null;

// Tab-Navigation
document.getElementById('tab-calculator').addEventListener('click', () => {
  switchTab('calculator');
});

document.getElementById('tab-calorimetry').addEventListener('click', () => {
  switchTab('calorimetry');
  // Stelle sicher, dass Lösungen geladen sind
  if (solutionManager.getAllSolutions().length === 0) {
    // Lade Standard-Lösungen falls keine vorhanden
    loadDefaultSolutions();
  }
});

document.getElementById('tab-formulas').addEventListener('click', () => {
  switchTab('formulas');
  loadFormulasToUI();
});

document.getElementById('tab-solutions').addEventListener('click', () => {
  switchTab('solutions');
});

function switchTab(tabName) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Phase-Änderung: Tag-Feld ein/ausblenden
document.getElementById('phase').addEventListener('change', (e) => {
  const dayGroup = document.getElementById('day-group');
  if (e.target.value === 'aggression') {
    dayGroup.style.display = 'block';
  } else {
    dayGroup.style.display = 'none';
  }
});

// Makronährstoff-Verteilung: Summe aktualisieren
function updateMacroSum() {
  const carbRatio = parseFloat(document.getElementById('carb-ratio').value) || 0;
  const fatRatio = parseFloat(document.getElementById('fat-ratio').value) || 0;
  const sum = carbRatio + fatRatio;
  document.getElementById('macro-sum').textContent = sum;

  // Warnung wenn nicht 100%
  const sumElement = document.getElementById('macro-sum');
  if (Math.abs(sum - 100) > 0.1) {
    sumElement.style.color = '#dc3545';
  } else {
    sumElement.style.color = '#764ba2';
  }
}

document.getElementById('carb-ratio').addEventListener('input', updateMacroSum);
document.getElementById('fat-ratio').addEventListener('input', updateMacroSum);

// Berechnungen durchführen
document.getElementById('calculate-btn').addEventListener('click', () => {
  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  const phase = document.getElementById('phase').value;
  const day = parseInt(document.getElementById('day').value) || 1;

  if (!weight || !height) {
    alert('Bitte Körpergewicht und Körpergröße eingeben.');
    return;
  }

  // Berechnungen
  const bmi = calculator.calculateBMI(weight, height);
  const ibw = calculator.calculateIBW(height);
  const abw = calculator.calculateABW(weight, ibw);

  let calorieGoal = calculator.calculateCalorieGoal(weight, bmi, ibw, phase, day);
  const cvvhd = document.getElementById('cvvhd-checkbox').checked;

  // Berechne Aminosäureziel
  let aminoGoal = calculator.calculateAminoAcidGoal(weight, bmi, ibw, phase, day);
  const aminoGoalBase = aminoGoal;
  if (cvvhd) {
    aminoGoal += calculator.calculateCVVHDAminoAcidAddition();
  }

  // Berechne Proteinziel
  let proteinGoal = calculator.calculateProteinGoal(weight, bmi, ibw, phase, day);
  const proteinGoalBase = proteinGoal;
  if (cvvhd) {
    proteinGoal += calculator.calculateCVVHDProteinAddition();
  }

  // Ergebnisse anzeigen
  document.getElementById('result-bmi').textContent = bmi.toFixed(1);
  document.getElementById('result-ibw').textContent = ibw.toFixed(1);
  document.getElementById('result-abw').textContent = abw.toFixed(1);

  // Zielwerte
  if (calorieGoal !== null) {
    document.getElementById('calorie-goal').value = Math.round(calorieGoal);
    document.getElementById('auto-calorie').textContent = `(automatisch: ${Math.round(calorieGoal)} kcal)`;
  } else {
    document.getElementById('calorie-goal').value = '';
    document.getElementById('auto-calorie').textContent = '(manuelle Eingabe erforderlich)';
  }

  document.getElementById('amino-goal').value = aminoGoal.toFixed(1);
  if (cvvhd) {
    document.getElementById('auto-amino').textContent = `(automatisch: ${aminoGoalBase.toFixed(1)} + ${calculator.calculateCVVHDAminoAcidAddition().toFixed(1)} CVVHD = ${aminoGoal.toFixed(1)} g)`;
  } else {
    document.getElementById('auto-amino').textContent = `(automatisch: ${aminoGoal.toFixed(1)} g)`;
  }

  document.getElementById('protein-goal').value = proteinGoal.toFixed(1);
  if (cvvhd) {
    document.getElementById('auto-protein').textContent = `(automatisch: ${proteinGoalBase.toFixed(1)} + ${calculator.calculateCVVHDProteinAddition().toFixed(1)} CVVHD = ${proteinGoal.toFixed(1)} g)`;
  } else {
    document.getElementById('auto-protein').textContent = `(automatisch: ${proteinGoal.toFixed(1)} g)`;
  }

  // Abschnitte anzeigen
  document.getElementById('results-section').style.display = 'block';
  document.getElementById('infusion-section').style.display = 'block';

  currentResults = { weight, height, bmi, ibw, abw, phase, day };
});

// Laufende Infusionen
let runningCount = 0;
document.getElementById('add-running-solution').addEventListener('click', () => {
  const container = document.getElementById('running-solutions-container');
  const row = createSolutionRow(`running-${runningCount++}`, true);
  container.insertBefore(row, document.getElementById('add-running-solution'));
});

// Geplante Infusionen
let plannedCount = 0;
document.getElementById('add-planned-solution').addEventListener('click', () => {
  const container = document.getElementById('planned-solutions-container');
  const row = createSolutionRow(`planned-${plannedCount++}`, false);
  container.insertBefore(row, document.getElementById('add-planned-solution'));
});

function createSolutionRow(id, isRunning) {
  const div = document.createElement('div');
  div.className = 'solution-row';
  div.id = id;

  const select = document.createElement('select');
  select.className = 'solution-select';

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Lösung auswählen --';
  select.appendChild(defaultOption);

  solutionManager.getAllSolutions().forEach(sol => {
    const option = document.createElement('option');
    option.value = sol.name;
    option.textContent = sol.name;
    select.appendChild(option);
  });

  div.appendChild(select);

  if (isRunning) {
    const rateInput = document.createElement('input');
    rateInput.type = 'number';
    rateInput.placeholder = 'Rate (ml/h)';
    rateInput.step = '0.1';
    rateInput.className = 'rate-input';
    div.appendChild(rateInput);
  } else {
    const placeholder = document.createElement('div');
    placeholder.textContent = '(wird berechnet)';
    placeholder.style.fontSize = '12px';
    placeholder.style.color = '#888';
    div.appendChild(placeholder);
  }

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Entfernen';
  removeBtn.addEventListener('click', () => div.remove());
  div.appendChild(removeBtn);

  return div;
}

// Laufraten berechnen
document.getElementById('calculate-rates-btn').addEventListener('click', () => {
  const targetCalories = parseFloat(document.getElementById('calorie-goal').value);
  const targetAminoAcids = parseFloat(document.getElementById('amino-goal').value) || 0;
  const targetProtein = parseFloat(document.getElementById('protein-goal').value) || 0;
  const ignoreAminoGoal = document.getElementById('ignore-amino-goal').checked;
  const ignoreProteinGoal = document.getElementById('ignore-protein-goal').checked;

  if (!targetCalories) {
    alert('Bitte zuerst Patientendaten berechnen und Kalorienziel eingeben.');
    return;
  }

  if (!ignoreAminoGoal && !targetAminoAcids && !ignoreProteinGoal && !targetProtein) {
    alert('Bitte Aminosäure- oder Proteinziel eingeben, oder beide Ziele als "ignorieren" markieren.');
    return;
  }

  // Laufende Lösungen sammeln
  const runningSolutions = [];
  document.querySelectorAll('#running-solutions-container .solution-row').forEach(row => {
    const select = row.querySelector('.solution-select');
    const rateInput = row.querySelector('.rate-input');
    if (select.value && rateInput.value) {
      runningSolutions.push({
        name: select.value,
        ratePerHour: parseFloat(rateInput.value)
      });
    }
  });

  // Geplante Lösungen sammeln
  const plannedSolutions = [];
  document.querySelectorAll('#planned-solutions-container .solution-row').forEach(row => {
    const select = row.querySelector('.solution-select');
    if (select.value) {
      plannedSolutions.push(select.value);
    }
  });

  if (plannedSolutions.length === 0) {
    alert('Bitte mindestens eine geplante Infusion auswählen.');
    return;
  }

  if (plannedSolutions.length > 3) {
    alert('Derzeit werden maximal 3 geplante Infusionen unterstützt.');
    return;
  }

  // Makronährstoff-Verteilung abrufen
  const carbRatio = parseFloat(document.getElementById('carb-ratio').value) || 70;
  const fatRatio = parseFloat(document.getElementById('fat-ratio').value) || 30;

  // Aktuelle Aufnahme berechnen
  const currentIntake = rateCalculator.calculateCurrentIntake(runningSolutions);
  document.getElementById('current-calories').textContent = Math.round(currentIntake.calories);
  document.getElementById('current-amino').textContent = currentIntake.aminoAcids.toFixed(1);

  // Erforderliche Raten berechnen
  const requiredRates = rateCalculator.calculateRequiredRates(
    targetCalories,
    targetAminoAcids,
    targetProtein,
    runningSolutions,
    plannedSolutions,
    carbRatio,
    fatRatio,
    ignoreAminoGoal,
    ignoreProteinGoal
  );

  // Ergebnisse anzeigen
  const ratesResults = document.getElementById('rates-results');
  ratesResults.innerHTML = '';

  if (requiredRates && requiredRates.length > 0) {
    requiredRates.forEach(rate => {
      const div = document.createElement('div');
      div.className = 'rate-result-item';

      const h4 = document.createElement('h4');
      h4.textContent = rate.name;
      div.appendChild(h4);

      const p1 = document.createElement('p');
      p1.innerHTML = `Laufrate: <strong>${rate.ratePerHour.toFixed(1)} ml/h</strong>`;
      div.appendChild(p1);

      const p2 = document.createElement('p');
      p2.innerHTML = `Gesamtvolumen: <strong>${rate.mlPerDay.toFixed(0)} ml/Tag</strong>`;
      div.appendChild(p2);

      if (rate.limitingFactor) {
        const p3 = document.createElement('p');
        p3.innerHTML = `Limitierender Faktor: <strong>${rate.limitingFactor}</strong>`;
        div.appendChild(p3);
      }

      if (rate.component) {
        const p4 = document.createElement('p');
        p4.innerHTML = `Komponente: <strong>${rate.component}</strong>`;
        p4.style.color = '#764ba2';
        div.appendChild(p4);
      }

      ratesResults.appendChild(div);
    });

    // Berechne tatsächliche Aufnahme durch geplante Infusionen
    let plannedCalories = 0;
    let plannedProtein = 0;
    let plannedAminoAcids = 0;
    let plannedCarbs = 0;
    let plannedFat = 0;

    requiredRates.forEach(rate => {
      const solution = solutionManager.findSolution(rate.name);
      if (solution) {
        plannedCalories += solution.kcalPerMl * rate.mlPerDay;
        plannedProtein += solutionManager.getTotalProteinEquivalent(solution, rate.mlPerDay);
        plannedAminoAcids += solutionManager.getTotalAminoAcidEquivalent(solution, rate.mlPerDay);
        plannedCarbs += solution.carbohydratesPerMl * rate.mlPerDay;
        plannedFat += solution.fatPerMl * rate.mlPerDay;
      }
    });

    // Zeige geplante Aufnahme an
    document.getElementById('planned-calories').textContent = Math.round(plannedCalories);
    document.getElementById('planned-protein').textContent = plannedProtein.toFixed(1);
    document.getElementById('planned-amino').textContent = plannedAminoAcids.toFixed(1);

    // Berechne Gesamtaufnahme (laufend + geplant)
    const totalCalories = currentIntake.calories + plannedCalories;
    const totalProtein = currentIntake.protein + plannedProtein;
    const totalAminoAcids = currentIntake.aminoAcids + plannedAminoAcids;
    const totalCarbs = (currentIntake.carbs || 0) + plannedCarbs;
    const totalFat = (currentIntake.fat || 0) + plannedFat;

    document.getElementById('total-calories').textContent = Math.round(totalCalories);
    document.getElementById('total-protein').textContent = totalProtein.toFixed(1);
    document.getElementById('total-amino').textContent = totalAminoAcids.toFixed(1);

    // Berechne Respiratorischen Quotienten (RQ)
    // RQ-Werte: Kohlenhydrate = 1.0, Fett = 0.7, Protein = 0.81
    // Berechnung basierend auf Kalorieanteilen
    const carbCalories = totalCarbs * 4;  // 1g KH = 4 kcal
    const fatCalories = totalFat * 9;     // 1g Fett = 9 kcal
    const proteinCalories = totalProtein * 4;  // 1g Protein = 4 kcal

    if (totalCalories > 0) {
      const rq = (carbCalories * 1.0 + fatCalories * 0.7 + proteinCalories * 0.81) / totalCalories;
      document.getElementById('respiratory-quotient').textContent = rq.toFixed(2);

      // Interpretation des RQ
      let interpretation = '';
      if (rq < 0.75) {
        interpretation = '(sehr fettbetont)';
      } else if (rq < 0.82) {
        interpretation = '(fettbetont)';
      } else if (rq < 0.88) {
        interpretation = '(ausgewogen)';
      } else if (rq < 0.95) {
        interpretation = '(kohlenhydratbetont)';
      } else {
        interpretation = '(sehr kohlenhydratbetont)';
      }
      document.getElementById('rq-interpretation').textContent = interpretation;
    } else {
      document.getElementById('respiratory-quotient').textContent = '-';
      document.getElementById('rq-interpretation').textContent = '';
    }

    // Vergleich mit Zielen
    const calDiff = totalCalories - targetCalories;
    const proteinDiff = totalProtein - targetProtein;
    const aminoDiff = totalAminoAcids - targetAminoAcids;

    updateComparison('total-cal-comparison', calDiff, 'kcal');
    updateComparison('total-protein-comparison', proteinDiff, 'g');
    updateComparison('total-amino-comparison', aminoDiff, 'g');

    document.getElementById('rates-section').style.display = 'block';
  } else {
    alert('Fehler bei der Berechnung der Laufraten. Bitte Eingaben überprüfen.');
  }
});

// Hilfsfunktion für Vergleichsanzeige
function updateComparison(elementId, difference, unit) {
  const element = document.getElementById(elementId);
  const absDiff = Math.abs(difference);

  if (Math.abs(difference) < 0.5) {
    element.textContent = '✓ Ziel erreicht';
    element.className = 'goal-comparison exact';
  } else if (difference > 0) {
    element.textContent = `(+${absDiff.toFixed(1)} ${unit} über Ziel)`;
    element.className = 'goal-comparison over';
  } else {
    element.textContent = `(-${absDiff.toFixed(1)} ${unit} unter Ziel)`;
    element.className = 'goal-comparison under';
  }
}

// Formeln laden
function loadFormulasToUI() {
  const formulas = calculator.formulas;

  document.getElementById('formula-ibw').value = formulas.ibw.formula;

  document.getElementById('formula-cal-agg-30-d13').value = formulas.caloriesAggression.bmiUnder30.day1to3.formula;
  document.getElementById('formula-cal-agg-30-d4').value = formulas.caloriesAggression.bmiUnder30.day4plus.formula;

  document.getElementById('formula-cal-agg-3050-d13').value = formulas.caloriesAggression.bmi30to50.day1to3.formula;
  document.getElementById('formula-cal-agg-3050-d4').value = formulas.caloriesAggression.bmi30to50.day4plus.formula;

  document.getElementById('formula-cal-agg-50-d13').value = formulas.caloriesAggression.bmiOver50.day1to3.formula;
  document.getElementById('formula-cal-agg-50-d4').value = formulas.caloriesAggression.bmiOver50.day4plus.formula;

  document.getElementById('formula-cal-post-30').value = formulas.caloriesPostaggression.bmiUnder30.formula;
  document.getElementById('formula-cal-post-3050').value = formulas.caloriesPostaggression.bmi30to50.formula;
  document.getElementById('formula-cal-post-50').value = formulas.caloriesPostaggression.bmiOver50.formula;

  document.getElementById('formula-amino-30-d13').value = formulas.aminoAcids.bmiUnder30.day1to3.formula;
  document.getElementById('formula-amino-30-d4').value = formulas.aminoAcids.bmiUnder30.day4plus.formula;
  document.getElementById('formula-amino-over30-d13').value = formulas.aminoAcids.bmiOver30.day1to3.formula;
  document.getElementById('formula-amino-over30-d4').value = formulas.aminoAcids.bmiOver30.day4plus.formula;

  document.getElementById('formula-protein-agg-30-d13').value = formulas.protein.aggression.bmiUnder30.day1to3.formula;
  document.getElementById('formula-protein-agg-30-d4').value = formulas.protein.aggression.bmiUnder30.day4plus.formula;
  document.getElementById('formula-protein-agg-over30-d13').value = formulas.protein.aggression.bmiOver30.day1to3.formula;
  document.getElementById('formula-protein-agg-over30-d4').value = formulas.protein.aggression.bmiOver30.day4plus.formula;

  document.getElementById('formula-protein-post-30').value = formulas.protein.postaggression.bmiUnder30.formula;
  document.getElementById('formula-protein-post-over30').value = formulas.protein.postaggression.bmiOver30.formula;

  document.getElementById('formula-cvvhd-amino').value = formulas.cvvhd.aminoAcids.formula;
  document.getElementById('formula-cvvhd-protein').value = formulas.cvvhd.protein.formula;
}

// Formeln speichern (LocalStorage statt Electron IPC)
document.getElementById('save-formulas-btn').addEventListener('click', () => {
  calculator.formulas.ibw.formula = document.getElementById('formula-ibw').value;

  calculator.formulas.caloriesAggression.bmiUnder30.day1to3.formula = document.getElementById('formula-cal-agg-30-d13').value;
  calculator.formulas.caloriesAggression.bmiUnder30.day4plus.formula = document.getElementById('formula-cal-agg-30-d4').value;

  calculator.formulas.caloriesAggression.bmi30to50.day1to3.formula = document.getElementById('formula-cal-agg-3050-d13').value;
  calculator.formulas.caloriesAggression.bmi30to50.day4plus.formula = document.getElementById('formula-cal-agg-3050-d4').value;

  calculator.formulas.caloriesAggression.bmiOver50.day1to3.formula = document.getElementById('formula-cal-agg-50-d13').value;
  calculator.formulas.caloriesAggression.bmiOver50.day4plus.formula = document.getElementById('formula-cal-agg-50-d4').value;

  calculator.formulas.caloriesPostaggression.bmiUnder30.formula = document.getElementById('formula-cal-post-30').value;
  calculator.formulas.caloriesPostaggression.bmi30to50.formula = document.getElementById('formula-cal-post-3050').value;
  calculator.formulas.caloriesPostaggression.bmiOver50.formula = document.getElementById('formula-cal-post-50').value;

  calculator.formulas.aminoAcids.bmiUnder30.day1to3.formula = document.getElementById('formula-amino-30-d13').value;
  calculator.formulas.aminoAcids.bmiUnder30.day4plus.formula = document.getElementById('formula-amino-30-d4').value;
  calculator.formulas.aminoAcids.bmiOver30.day1to3.formula = document.getElementById('formula-amino-over30-d13').value;
  calculator.formulas.aminoAcids.bmiOver30.day4plus.formula = document.getElementById('formula-amino-over30-d4').value;

  calculator.formulas.protein.aggression.bmiUnder30.day1to3.formula = document.getElementById('formula-protein-agg-30-d13').value;
  calculator.formulas.protein.aggression.bmiUnder30.day4plus.formula = document.getElementById('formula-protein-agg-30-d4').value;
  calculator.formulas.protein.aggression.bmiOver30.day1to3.formula = document.getElementById('formula-protein-agg-over30-d13').value;
  calculator.formulas.protein.aggression.bmiOver30.day4plus.formula = document.getElementById('formula-protein-agg-over30-d4').value;

  calculator.formulas.protein.postaggression.bmiUnder30.formula = document.getElementById('formula-protein-post-30').value;
  calculator.formulas.protein.postaggression.bmiOver30.formula = document.getElementById('formula-protein-post-over30').value;

  calculator.formulas.cvvhd.aminoAcids.formula = document.getElementById('formula-cvvhd-amino').value;
  calculator.formulas.cvvhd.protein.formula = document.getElementById('formula-cvvhd-protein').value;

  // LocalStorage speichern
  try {
    localStorage.setItem('formulas', JSON.stringify(calculator.formulas));
    alert('Formeln erfolgreich gespeichert!');
  } catch (error) {
    alert('Fehler beim Speichern der Formeln: ' + error.message);
  }
});

// Formeln zurücksetzen
document.getElementById('reset-formulas-btn').addEventListener('click', () => {
  if (confirm('Möchten Sie wirklich alle Formeln auf die Standardwerte zurücksetzen?')) {
    calculator.formulas = new NutritionCalculator().formulas;
    loadFormulasToUI();
    localStorage.removeItem('formulas');
    alert('Formeln wurden zurückgesetzt.');
  }
});

// ===== INDIREKTE KALORIMETRIE TAB =====

// Hilfsvariablen für Calorimetrie
let calculatedRQ = null;

// Hilfsfunktion: Standard-Lösungen laden
function loadDefaultSolutions() {
  // Die Default-Lösungen sind bereits im solutionManager constructor hinterlegt
  // Diese Funktion stellt sicher, dass sie verfügbar sind
  if (solutionManager.getAllSolutions().length === 0) {
    // Fallback: Erstelle neuen Manager mit Defaults
    const tempManager = new InfusionSolutionManager();
    tempManager.getAllSolutions().forEach(sol => {
      solutionManager.addSolution(sol);
    });
  }
  updateSolutionsTable();
}

// Funktion: Prüfe ob "Indirekte Kalorimetrie" Button aktiviert werden kann
function updateCalorimetryButtonState() {
  const vco2 = parseFloat(document.getElementById('measured-vco2').value);
  const hasInfusions = document.querySelectorAll('#calorimetry-solutions-container .solution-row').length > 0;
  const button = document.getElementById('calculate-calorimetry-btn');

  if (vco2 > 0 && hasInfusions && calculatedRQ) {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
}

// VCO2 Input überwachen
document.getElementById('measured-vco2').addEventListener('input', updateCalorimetryButtonState);

// Hinzufügen von Lösungen für Kalorimetrie
document.getElementById('add-calorimetry-solution').addEventListener('click', () => {
  const container = document.getElementById('calorimetry-solutions-container');
  const solutionRow = createCalorimetrySolutionRow();
  const addButton = document.getElementById('add-calorimetry-solution');
  container.insertBefore(solutionRow, addButton);
  updateCalorimetryButtonState();
});

function createCalorimetrySolutionRow() {
  const div = document.createElement('div');
  div.className = 'solution-row';

  const select = document.createElement('select');
  select.className = 'solution-select';

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Lösung auswählen...';
  select.appendChild(defaultOption);

  solutionManager.getAllSolutions().forEach(solution => {
    const option = document.createElement('option');
    option.value = solution.name;
    option.textContent = solution.name;
    select.appendChild(option);
  });

  const rateInput = document.createElement('input');
  rateInput.type = 'number';
  rateInput.className = 'rate-input';
  rateInput.placeholder = 'Laufrate (ml/h)';
  rateInput.step = '0.1';
  rateInput.min = '0';

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '✕';
  removeBtn.className = 'remove-button';
  removeBtn.addEventListener('click', () => {
    div.remove();
    updateCalorimetryButtonState();
  });

  div.appendChild(select);
  div.appendChild(rateInput);
  div.appendChild(removeBtn);

  return div;
}

// RQ berechnen
document.getElementById('calculate-rq-btn').addEventListener('click', () => {
  const calorimetrySolutions = [];
  document.querySelectorAll('#calorimetry-solutions-container .solution-row').forEach(row => {
    const select = row.querySelector('.solution-select');
    const rateInput = row.querySelector('.rate-input');
    if (select.value && rateInput.value) {
      calorimetrySolutions.push({
        name: select.value,
        ratePerHour: parseFloat(rateInput.value)
      });
    }
  });

  if (calorimetrySolutions.length === 0) {
    alert('Bitte mindestens eine laufende Infusion eingeben.');
    return;
  }

  // Berechne Nährstoffaufnahme
  let totalCalories = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalProtein = 0;

  calorimetrySolutions.forEach(sol => {
    const solution = solutionManager.findSolution(sol.name);
    if (solution) {
      const mlPerDay = sol.ratePerHour * 24;
      totalCalories += solution.kcalPerMl * mlPerDay;
      totalCarbs += solution.carbohydratesPerMl * mlPerDay;
      totalFat += solution.fatPerMl * mlPerDay;
      totalProtein += solutionManager.getTotalProteinEquivalent(solution, mlPerDay);
    }
  });

  // Zeige Nährstoffwerte an
  document.getElementById('calorimetry-calories').textContent = Math.round(totalCalories);
  document.getElementById('calorimetry-carbs').textContent = totalCarbs.toFixed(1);
  document.getElementById('calorimetry-fat').textContent = totalFat.toFixed(1);
  document.getElementById('calorimetry-protein').textContent = totalProtein.toFixed(1);

  // Berechne RQ
  const carbCalories = totalCarbs * 4;
  const fatCalories = totalFat * 9;
  const proteinCalories = totalProtein * 4;

  if (totalCalories > 0) {
    calculatedRQ = (carbCalories * 1.0 + fatCalories * 0.7 + proteinCalories * 0.81) / totalCalories;
    document.getElementById('calorimetry-rq').textContent = calculatedRQ.toFixed(2);

    // Interpretation
    let interpretation = '';
    if (calculatedRQ < 0.75) {
      interpretation = '(sehr fettbetont)';
    } else if (calculatedRQ < 0.82) {
      interpretation = '(fettbetont)';
    } else if (calculatedRQ < 0.88) {
      interpretation = '(ausgewogen)';
    } else if (calculatedRQ < 0.95) {
      interpretation = '(kohlenhydratbetont)';
    } else {
      interpretation = '(sehr kohlenhydratbetont)';
    }
    document.getElementById('calorimetry-rq-interpretation').textContent = interpretation;
  }

  document.getElementById('rq-results-section').style.display = 'block';
  updateCalorimetryButtonState();
});

// Indirekte Kalorimetrie berechnen
document.getElementById('calculate-calorimetry-btn').addEventListener('click', () => {
  const vco2 = parseFloat(document.getElementById('measured-vco2').value);

  if (!vco2) {
    alert('Bitte VCO2-Wert vom Beatmungsgerät eingeben.');
    return;
  }

  if (!calculatedRQ) {
    alert('Bitte zuerst "RQ berechnen" klicken.');
    return;
  }

  document.getElementById('used-rq').textContent = calculatedRQ.toFixed(2);
  document.getElementById('used-vco2').textContent = Math.round(vco2);

  // Berechne VO2 aus VCO2 und RQ
  // RQ = VCO2 / VO2  =>  VO2 = VCO2 / RQ
  const vo2 = vco2 / calculatedRQ;
  document.getElementById('calculated-vo2').textContent = Math.round(vo2);

  // Berechne Energieumsatz mit Weir-Formel
  // REE (kcal/Tag) = [3.941 × VO2 (L/min) + 1.106 × VCO2 (L/min)] × 1440
  const vo2L = vo2 / 1000; // ml/min -> L/min
  const vco2L = vco2 / 1000; // ml/min -> L/min

  const ree = (3.941 * vo2L + 1.106 * vco2L) * 1440;

  document.getElementById('calculated-ree').textContent = Math.round(ree);

  // Interpretation
  let interpretation = `Der berechnete Energieumsatz beträgt ${Math.round(ree)} kcal/Tag. `;
  if (calculatedRQ < 0.7) {
    interpretation += 'Der RQ ist ungewöhnlich niedrig (<0.7), bitte Werte überprüfen.';
  } else if (calculatedRQ > 1.0) {
    interpretation += 'Der RQ ist >1.0, was auf Lipogenese (Fettaufbau aus Kohlenhydraten) oder Hyperventilation hindeuten kann.';
  } else if (calculatedRQ < 0.75) {
    interpretation += 'Ausgeprägte Fettoxidation (ketogener Stoffwechsel).';
  } else if (calculatedRQ < 0.85) {
    interpretation += 'Gemischte Fett- und Kohlenhydratoxidation.';
  } else {
    interpretation += 'Vorwiegend Kohlenhydratoxidation.';
  }

  // Vergleich mit eingegebener Ernährung
  const nutritionCalories = document.getElementById('calorimetry-calories').textContent;
  if (nutritionCalories !== '-') {
    const nutritionCal = parseInt(nutritionCalories);
    const difference = nutritionCal - Math.round(ree);
    interpretation += `\n\nErnährungszufuhr: ${nutritionCal} kcal/Tag. `;
    if (Math.abs(difference) < 100) {
      interpretation += 'Die Ernährung entspricht in etwa dem gemessenen Bedarf.';
    } else if (difference > 0) {
      interpretation += `Überernährung um ca. ${difference} kcal/Tag.`;
    } else {
      interpretation += `Unterernährung um ca. ${Math.abs(difference)} kcal/Tag.`;
    }
  }

  document.getElementById('ee-interpretation').textContent = interpretation;
  document.getElementById('calorimetry-results-section').style.display = 'block';
});

// CSV importieren (Browser File API)
document.getElementById('import-csv-btn').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target.result;
        const solutions = solutionManager.parseCSV(csvContent);
        displaySolutions(solutions);

        // Lösungen im LocalStorage speichern
        localStorage.setItem('solutions', JSON.stringify(solutions));

        alert(`${solutions.length} Lösungen erfolgreich importiert!`);
      } catch (error) {
        alert('Fehler beim Importieren: ' + error.message);
      }
    };

    reader.readAsText(file);
  });

  input.click();
});

function displaySolutions(solutions) {
  const tbody = document.getElementById('solutions-tbody');
  tbody.innerHTML = '';

  if (solutions.length === 0) {
    const row = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'Keine Lösungen geladen.';
    row.appendChild(td);
    tbody.appendChild(row);
    return;
  }

  solutions.forEach(sol => {
    const row = document.createElement('tr');

    const cells = [
      sol.name,
      sol.kcalPerMl.toFixed(4),
      sol.proteinPerMl.toFixed(4),
      sol.aminoAcidsPerMl.toFixed(4),
      sol.fatPerMl.toFixed(4),
      sol.carbohydratesPerMl.toFixed(4)
    ];

    cells.forEach(cellText => {
      const td = document.createElement('td');
      td.textContent = cellText;
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });
}

// Beim Start: Gespeicherte Daten laden
(function initApp() {
  // Gespeicherte Formeln laden
  try {
    const savedFormulas = localStorage.getItem('formulas');
    if (savedFormulas) {
      calculator.formulas = JSON.parse(savedFormulas);
    }
  } catch (error) {
    console.error('Fehler beim Laden der Formeln:', error);
  }

  // Gespeicherte Lösungen laden (oder Default-Lösungen anzeigen)
  try {
    const savedSolutions = localStorage.getItem('solutions');
    if (savedSolutions) {
      const solutions = JSON.parse(savedSolutions);
      solutionManager.solutions = solutions;
      displaySolutions(solutions);
    } else {
      // Zeige Default-Lösungen beim ersten Start
      displaySolutions(solutionManager.solutions);
    }
  } catch (error) {
    console.error('Fehler beim Laden der Lösungen:', error);
    // Bei Fehler: Zeige Default-Lösungen
    displaySolutions(solutionManager.solutions);
  }
})();
