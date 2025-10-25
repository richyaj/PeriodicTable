/* app.js — enhanced to display full element details
   Assumes a global elementsData array of objects with:
   {
     number, symbol, name, mass, electron_config, material, column, row,
     origin, discovery, discovered_by, year,
     physical_properties: { state_at_room_temp, color, density, melting_point, boiling_point },
     formation_and_origin, common_uses, interesting_factoid, sources
   }
*/

/* ---------- Bootstrap ---------- */
document.addEventListener('DOMContentLoaded', () => {
  createPeriodicTable();
  setupDetailDrawer();
  setupKeyboardNavigation();
});

/* ---------- Table rendering ---------- */
function createPeriodicTable() {
  const table = document.getElementById('table');
  table.setAttribute('role', 'grid');
  table.setAttribute('aria-label', 'Interactive Periodic Table');

  // Render elements
  elementsData.forEach(d => {
    const el = createElementDiv(d);
    table.appendChild(el);
  });

  // Placeholders (lanthanoids, actinoids) and gap
  table.appendChild(createPlaceholder('57–71', 'lanthanoid', 3, 6));
  table.appendChild(createPlaceholder('89–103', 'actinoid', 3, 7));

  const gap = document.createElement('div');
  gap.className = 'gap c3 r8';
  gap.setAttribute('aria-hidden', 'true');
  table.appendChild(gap);

  // Key (legend) if original app had one
  const key = createKey?.();
  if (key) table.appendChild(key);
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

function createElementDiv(d) {
  const {
    number, symbol, name, mass, electron_config,
    material, column, row
  } = d;

  const el = document.createElement('button');
  el.type = 'button';
  el.className = `element ${material} c${column} r${row}`;
  el.setAttribute('role', 'gridcell');
  el.setAttribute('aria-label', `${name} (${symbol}), atomic number ${number}`);
  el.dataset.number = number;

  el.innerHTML = `
    <div class="element-top">
      <span class="atomic-number">${number}</span>
      <span class="atomic-mass">${formatMass(mass)}</span>
    </div>
    <div class="element-center">
      <span class="symbol">${symbol}</span>
    </div>
    <div class="element-bottom">
      <span class="name">${name}</span>
    </div>
  `;

  el.addEventListener('click', () => openDetail(number));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetail(number);
    }
  });

  return el;
}

function createPlaceholder(text, material, column, row) {
  const el = document.createElement('div');
  el.className = `placeholder ${material} c${column} r${row}`;
  el.setAttribute('aria-hidden', 'true');
  el.textContent = text;
  return el;
}

/* ---------- Detail drawer ---------- */
function setupDetailDrawer() {
  // If index.html doesn't yet have these, call injectDetailDrawerShell()
  const drawer = document.getElementById('detail-drawer');
  if (!drawer) injectDetailDrawerShell();

  const closeBtn = document.getElementById('detail-close');
  closeBtn?.addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
  });
}

function injectDetailDrawerShell() {
  const drawer = document.createElement('aside');
  drawer.id = 'detail-drawer';
  drawer.className = 'detail-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-labelledby', 'detail-title');
  drawer.innerHTML = `
    <div class="detail-header">
      <div class="title-block">
        <div class="title-line">
          <span id="detail-symbol" class="detail-symbol"></span>
          <h2 id="detail-title" class="detail-title"></h2>
        </div>
        <div class="subtitle-line">
          <span id="detail-atomic" class="detail-atomic"></span>
          <span id="detail-mass" class="detail-mass"></span>
          <span id="detail-state" class="detail-state"></span>
        </div>
      </div>
      <button id="detail-close" class="detail-close" aria-label="Close details">×</button>
    </div>
    <div id="detail-content" class="detail-content">
      <section class="detail-section">
        <h3>Discovery</h3>
        <div class="kv">
          <div><span class="k">Discovery</span><span id="d-discovery" class="v"></span></div>
          <div><span class="k">Discovered by</span><span id="d-discovered-by" class="v"></span></div>
          <div><span class="k">Year</span><span id="d-year" class="v"></span></div>
        </div>
      </section>
      <section class="detail-section">
        <h3>Physical properties</h3>
        <div class="kv">
          <div><span class="k">State (25 °C)</span><span id="p-state" class="v"></span></div>
          <div><span class="k">Color</span><span id="p-color" class="v"></span></div>
          <div><span class="k">Density</span><span id="p-density" class="v"></span></div>
          <div><span class="k">Melting point</span><span id="p-mp" class="v"></span></div>
          <div><span class="k">Boiling point</span><span id="p-bp" class="v"></span></div>
          <div><span class="k">Electron config</span><span id="p-config" class="v mono"></span></div>
        </div>
      </section>
      <section class="detail-section">
        <h3>Origin</h3>
        <p id="d-origin" class="para"></p>
        <p id="d-formation" class="para"></p>
      </section>
      <section class="detail-section">
        <h3>Common uses</h3>
        <ul id="d-uses" class="bullets"></ul>
      </section>
      <section class="detail-section">
        <h3>Interesting</h3>
        <p id="d-fact" class="para"></p>
      </section>
      <section class="detail-section">
        <h3>Sources</h3>
        <ul id="d-sources" class="links"></ul>
      </section>
    </div>
  `;
  document.body.appendChild(drawer);
}

function openDetail(atomicNumber) {
  const d = elementsData.find(e => e.number === Number(atomicNumber));
  if (!d) return;

  const drawer = document.getElementById('detail-drawer');
  const prevActive = document.activeElement;

  // Header
  setText('detail-symbol', d.symbol ?? '');
  setText('detail-title', d.name ?? '');
  setText('detail-atomic', `Z ${d.number ?? ''}`);
  setText('detail-mass', d.mass != null ? `Mass ${formatMass(d.mass)}` : '');
  setText('detail-state', norm(d.physical_properties?.state_at_room_temp));

  // Discovery
  setText('d-discovery', norm(d.discovery));
  setText('d-discovered-by', norm(d.discovered_by));
  setText('d-year', norm(d.year));

  // Physical properties
  const p = d.physical_properties || {};
  setText('p-state', norm(p.state_at_room_temp));
  setText('p-color', norm(p.color));
  setText('p-density', formatDensity(p.density));
  setText('p-mp', formatTemp(p.melting_point));
  setText('p-bp', formatTemp(p.boiling_point));
  setText('p-config', formatElectronConfig(d.electron_config));

  // Origin and formation
  setText('d-origin', norm(d.origin));
  setText('d-formation', norm(d.formation_and_origin));

  // Uses
  const usesUl = document.getElementById('d-uses');
  usesUl.innerHTML = '';
  if (Array.isArray(d.common_uses) && d.common_uses.length) {
    d.common_uses.forEach(u => {
      const li = document.createElement('li');
      li.textContent = u;
      usesUl.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No common uses on record';
    li.className = 'muted';
    usesUl.appendChild(li);
  }

  // Fact
  setText('d-fact', norm(d.interesting_factoid));

  // Sources
  const srcUl = document.getElementById('d-sources');
  srcUl.innerHTML = '';
  if (Array.isArray(d.sources) && d.sources.length) {
    d.sources.forEach(url => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = prettifySource(url);
      li.appendChild(a);
      srcUl.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No sources available';
    li.className = 'muted';
    srcUl.appendChild(li);
  }

  // Drawer show
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  const closeBtn = document.getElementById('detail-close');
  closeBtn.focus();

  // Store previous focus for restoration on close
  drawer.dataset.returnFocus = getElementSelector(prevActive) || '';
}

function closeDetail() {
  const drawer = document.getElementById('detail-drawer');
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');

  // Restore focus if possible
  const sel = drawer.dataset.returnFocus;
  if (sel) {
    const el = document.querySelector(sel);
    el?.focus();
  }
}

/* ---------- Keyboard navigation between cells ---------- */
function setupKeyboardNavigation() {
  const grid = document.getElementById('table');
  grid.addEventListener('keydown', (e) => {
    const target = e.target.closest('.element');
    if (!target) return;
    const current = +target.dataset.number;
    let next = null;

    switch (e.key) {
      case 'ArrowRight': next = findNext(current, +1); break;
      case 'ArrowLeft':  next = findNext(current, -1); break;
      case 'ArrowDown':  next = findByRowShift(current, +1); break;
      case 'ArrowUp':    next = findByRowShift(current, -1); break;
      default: return;
    }
    if (next != null) {
      e.preventDefault();
      const btn = document.querySelector(`.element[data-number="${next}"]`);
      btn?.focus();
    }
  });
}

function findNext(current, dir) {
  const idx = elementsData.findIndex(e => e.number === current);
  const nextIdx = idx + dir;
  if (nextIdx < 0 || nextIdx >= elementsData.length) return null;
  return elementsData[nextIdx].number;
}
function findByRowShift(current, dir) {
  const cur = elementsData.find(e => e.number === current);
  if (!cur) return null;
  const targetRow = cur.row + dir;
  // Try to find same column in target row; fallback scan
  const sameCol = elementsData.find(e => e.row === targetRow && e.column === cur.column);
  if (sameCol) return sameCol.number;
  const firstInRow = elementsData.find(e => e.row === targetRow);
  return firstInRow?.number ?? null;
}

/* ---------- Utilities ---------- */
function formatMass(m) {
  if (m == null) return '';
  return typeof m === 'number' ? m.toFixed(3).replace(/\.?0+$/, '') : String(m);
}
function formatTemp(t) {
  if (t == null) return '—';
  const n = Number(t);
  if (!Number.isFinite(n)) return '—';
  return `${stripTrailingZeros(n)} °C`;
}
function formatDensity(d) {
  if (d == null) return '—';
  const n = Number(d);
  if (!Number.isFinite(n)) return '—';
  return `${stripTrailingZeros(n)} g/cm³`;
}
function stripTrailingZeros(n) {
  return n.toFixed(4).replace(/\.?0+$/, '');
}
function norm(v) {
  if (v == null) return '—';
  const s = Array.isArray(v) ? v.join(', ') : String(v);
  return s.trim() === '' ? '—' : s;
}
function formatElectronConfig(cfg) {
  if (!cfg) return '—';
  // Your base uses an array like [2,8,1]; render as 1s2 2s2 2p6 style is nontrivial without subshell info.
  // Show compact "shell" notation: [2,8,1]
  return Array.isArray(cfg) ? `[${cfg.join(', ')}]` : String(cfg);
}
function prettifySource(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('rsc.org')) return 'Royal Society of Chemistry';
    if (u.hostname.includes('pubchem.ncbi.nlm.nih.gov')) return 'PubChem';
    if (u.hostname.includes('iupac')) return 'IUPAC';
    return u.hostname.replace('www.', '');
  } catch {
    return url;
  }
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? '';
}
function getElementSelector(el) {
  if (!el) return '';
  if (el.id) return `#${el.id}`;
  if (el.className) return `${el.tagName.toLowerCase()}.${String(el.className).split(' ').join('.')}`;
  return el.tagName.toLowerCase();
}
