// Generate periodic table from data
function createPeriodicTable() {
  const table = document.getElementById('table');
  
  // Create all elements
  elementsData.forEach(data => {
    const [number, symbol, name, mass, weight, material, column, row] = data;
    const element = createElementDiv(number, symbol, name, mass, weight, material, column, row);
    table.appendChild(element);
  });
  
  // Add placeholders for lanthanoids and actinoids
  table.appendChild(createPlaceholder('57-71', 'lanthanoid', 3, 6));
  table.appendChild(createPlaceholder('89-103', 'actinoid', 3, 7));
  
  // Add gap
  const gap = document.createElement('div');
  gap.className = 'gap c3 r8';
  table.appendChild(gap);
  
  // Add key
  table.appendChild(createKey());
}

// Create element div
function createElementDiv(number, symbol, name, mass, weight, material, column, row) {
  const el = document.createElement('div');
  el.className = `element ${material} c${column} r${row}`;
  
  // Create structure
  el.innerHTML = `
    <input class="activate" type="radio" name="elements">
    <input class="deactivate" type="radio" name="elements">
    <div class="overlay"></div>
    <div class="square">
      <div class="model">${createOrbitals(weight)}</div>
      <div class="atomic-number">${number}</div>
      <div class="label">
        <div class="symbol">${symbol}</div>
        <div class="name">${name}</div>
      </div>
      <div class="atomic-mass">${mass}</div>
      <ul class="atomic-weight">${createWeightList(weight)}</ul>
    </div>
  `;
  
  return el;
}

// Create electron orbitals
function createOrbitals(weight) {
  const reversed = [...weight].reverse();
  let html = '';
  
  reversed.forEach(count => {
    const electrons = createElectrons(count);
    html += `<div class="orbital">${electrons}</div>`;
  });
  
  return html;
}

// Create electrons for an orbital
function createElectrons(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += '<div class="electron"></div>';
  }
  return html;
}

// Create atomic weight list
function createWeightList(weight) {
  const reversed = [...weight].reverse();
  return reversed.map(w => `<li>${w}</li>`).join('');
}

// Create placeholder
function createPlaceholder(text, material, column, row) {
  const ph = document.createElement('div');
  ph.className = `placeholder ${material} c${column} r${row}`;
  ph.innerHTML = `<div class="square">${text}</div>`;
  return ph;
}

// Create key/legend
function createKey() {
  const key = document.createElement('div');
  key.className = 'key';
  
  const categories = [
    ['alkali-metal', 'alkali-metals', 'Alkali Metals'],
    ['alkaline-earth-metal', 'alkaline-earth-metals', 'Alkaline Earth Metals'],
    ['lanthanoid', 'lanthanoids', 'Lanthanoids'],
    ['actinoid', 'actinoids', 'Actinoids'],
    ['transition-metal', 'transition-metals', 'Transition Metals'],
    ['post-transition-metal', 'post-transition-metals', 'Post-Transition Metals'],
    ['metalloid', 'metalloids', 'Metalloids'],
    ['other-nonmetal', 'other-nonmetals', 'Other Nonmetals'],
    ['noble-gas', 'noble-gasses', 'Noble Gases'],
    ['unknown', 'unknown', 'Unknown']
  ];
  
  const row = document.createElement('div');
  row.className = 'row';
  
  categories.forEach(([className, id, label]) => {
    const labelEl = document.createElement('label');
    labelEl.className = className;
    labelEl.setAttribute('for', id);
    labelEl.textContent = label;
    row.appendChild(labelEl);
  });
  
  key.appendChild(row);
  return key;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', createPeriodicTable);