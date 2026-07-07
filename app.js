// Hauptanwendung - Browser-Version (ohne Electron)
const calculator = new NutritionCalculator();
const solutionManager = new InfusionSolutionManager();
const rateCalculator = new InfusionRateCalculator(solutionManager);

let currentResults = null;

// Tab-Navigation
document.getElementById('tab-calculator').addEventListener('click', () => {
  switchTab('calculator');
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
  const aminoGoal = calculator.calculateAminoAcidGoal(weight, bmi, ibw);

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
  document.getElementById('auto-amino').textContent = `(automatisch: ${aminoGoal.toFixed(1)} g)`;

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
  const targetAminoAcids = parseFloat(document.getElementById('amino-goal').value);

  if (!targetCalories || !targetAminoAcids) {
    alert('Bitte zuerst Patientendaten berechnen und Zielwerte eingeben.');
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

  if (plannedSolutions.length > 2) {
    alert('Derzeit werden maximal 2 geplante Infusionen unterstützt.');
    return;
  }

  // Aktuelle Aufnahme berechnen
  const currentIntake = rateCalculator.calculateCurrentIntake(runningSolutions);
  document.getElementById('current-calories').textContent = Math.round(currentIntake.calories);
  document.getElementById('current-amino').textContent = currentIntake.aminoAcids.toFixed(1);

  // Erforderliche Raten berechnen
  const requiredRates = rateCalculator.calculateRequiredRates(
    targetCalories,
    targetAminoAcids,
    runningSolutions,
    plannedSolutions
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

      ratesResults.appendChild(div);
    });

    document.getElementById('rates-section').style.display = 'block';
  } else {
    alert('Fehler bei der Berechnung der Laufraten. Bitte Eingaben überprüfen.');
  }
});

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

  document.getElementById('formula-amino-30').value = formulas.aminoAcids.bmiUnder30.formula;
  document.getElementById('formula-amino-over30').value = formulas.aminoAcids.bmiOver30.formula;
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

  calculator.formulas.aminoAcids.bmiUnder30.formula = document.getElementById('formula-amino-30').value;
  calculator.formulas.aminoAcids.bmiOver30.formula = document.getElementById('formula-amino-over30').value;

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
