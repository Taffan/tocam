(function() {
  'use strict';

  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => reg.unregister());
    });
  }
  if (window.caches) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }

  const DB_NAME = 'PhotoReportsDB_v6';
  const STORE_NAME = 'reports';

  let db = null;
  let currentReport = null;
  let currentSectionIndex = null;
  let selectedPhotoType = null;
  let selectedType = null;
  let equipmentCounts = {};
  let codeReader = null;
  let videoStream = null;
  let lastScannedCode = null;
  let autoSaveTimer = null;
  let scanCooldown = false;
  let scanTimer = null;
  let deferredPrompt = null;
  let pageHistory = ['home'];
  let currentPage = 'home';
  let cachedBlob = null;
  let cachedFilename = '';

  function init() {
    initDB().then(() => {
      loadDrafts();
      setupEventListeners();
      setDefaultDate();
      setupInstallPrompt();
      showPage('home');
    });
  }

  function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => { db = request.result; resolve(db); };
      request.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
  }

  function setDefaultDate() {
    document.getElementById('input-date').value = new Date().toISOString().split('T')[0];
  }

  function setupInstallPrompt() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      if (!localStorage.getItem('iosInstallShown')) {
        setTimeout(() => {
          document.getElementById('ios-install').classList.remove('hidden');
        }, 2000);
      }
      document.getElementById('btn-close-ios').addEventListener('click', () => {
        document.getElementById('ios-install').classList.add('hidden');
        localStorage.setItem('iosInstallShown', 'true');
      });
    } else {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (!localStorage.getItem('installPromptShown')) {
          setTimeout(() => {
            document.getElementById('install-prompt').classList.remove('hidden');
          }, 3000);
        }
      });

      document.getElementById('btn-install').addEventListener('click', async () => {
        if (deferredPrompt) {
          await deferredPrompt.prompt();
          deferredPrompt = null;
          document.getElementById('install-prompt').classList.add('hidden');
          localStorage.setItem('installPromptShown', 'true');
        }
      });

      document.getElementById('btn-install-close').addEventListener('click', () => {
        document.getElementById('install-prompt').classList.add('hidden');
        localStorage.setItem('installPromptShown', 'true');
      });
    }
  }

  function setupEventListeners() {
    document.getElementById('header-back').addEventListener('click', goBack);
    document.getElementById('btn-new-report').addEventListener('click', () => { cachedBlob = null; showPage('config'); });

    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', () => selectType(btn.dataset.type));
    });

    document.getElementById('config-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (selectedType && hasEquipment()) {
        showPage('data');
        renderConfigSummary();
      }
    });

    document.getElementById('back-from-data').addEventListener('click', () => showPage('config'));
    document.getElementById('back-from-checklist').addEventListener('click', () => {
      saveReport();
      showPage('data');
    });
    document.getElementById('back-from-photos').addEventListener('click', () => {
      saveReport();
      showChecklist();
    });
    document.getElementById('back-from-ke').addEventListener('click', () => {
      stopScanner();
      showPhotoSection();
    });

    document.getElementById('report-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('btn-finish-report').addEventListener('click', () => {
      finishReport();
    });
    document.getElementById('btn-save-section').addEventListener('click', saveCurrentSection);

    document.getElementById('camera-input').addEventListener('change', handleCameraCapture);
    document.getElementById('gallery-input').addEventListener('change', handleGallerySelect);

    document.getElementById('btn-save-ke').addEventListener('click', () => {
      stopScanner();
      showChecklist();
    });
    document.getElementById('btn-ke-add-manual').addEventListener('click', () => {
      const input = document.getElementById('ke-manual-input');
      const code = input.value.trim();
      if (code) {
        addKECode(code);
        input.value = '';
        input.focus();
      }
    });
    document.getElementById('ke-manual-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const code = e.target.value.trim();
        if (code) {
          addKECode(code);
          e.target.value = '';
        }
      }
    });

    document.getElementById('btn-download').addEventListener('click', () => {
      if (currentReport.status !== 'completed') {
        showToast('Сначала завершите отчёт');
        return;
      }
      downloadArchive();
    });
    document.getElementById('btn-share').addEventListener('click', () => {
      if (currentReport.status !== 'completed') {
        showToast('Сначала завершите отчёт');
        return;
      }
      shareReport();
    });
    document.getElementById('btn-new-from-complete').addEventListener('click', () => {
      currentReport = null;
      cachedBlob = null;
      showPage('home');
    });
  }

  function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(`page-${pageName}`).classList.remove('hidden');
    currentPage = pageName;

    if (pageName === 'home') {
      pageHistory = ['home'];
      loadDrafts();
    } else if (pageHistory[pageHistory.length - 1] !== pageName) {
      pageHistory.push(pageName);
    }

    updateHeaderBack();
  }

  function updateHeaderBack() {
    const backBtn = document.getElementById('header-back');
    backBtn.classList.toggle('hidden', currentPage === 'home');
  }

  function goBack() {
    if (pageHistory.length > 1) {
      pageHistory.pop();
      showPage(pageHistory[pageHistory.length - 1] || 'home');
    } else {
      showPage('home');
    }
  }

  function loadDrafts() {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => {
      renderDrafts(request.result);
    };
  }

  function renderDrafts(drafts) {
    const container = document.getElementById('drafts-list');
    document.getElementById('drafts-count').textContent = drafts.length;

    if (!drafts.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <div class="empty-state-text">Нет сохранённых отчётов</div>
        </div>
      `;
      return;
    }

    container.innerHTML = drafts.map(draft => `
      <div class="draft-card" data-id="${escapeHtml(draft.id)}">
        <div class="draft-icon">${getTypeIcon(draft.objectType)}</div>
        <div class="draft-info">
          <div class="draft-name">${escapeHtml(draft.reportName)}</div>
          <div class="draft-meta">${escapeHtml(draft.technician)} - ${formatDate(draft.date)}</div>
        </div>
        <button class="draft-delete" data-id="${escapeHtml(draft.id)}" title="Удалить">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.draft-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.draft-delete')) return;
        const tx = db.transaction(STORE_NAME, 'readonly');
        tx.objectStore(STORE_NAME).get(card.dataset.id).onsuccess = (e) => {
          currentReport = e.target.result;
          showChecklist();
        };
      });
    });

    container.querySelectorAll('.draft-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Удалить этот отчёт?')) {
          deleteReport(btn.dataset.id);
        }
      });
    });
  }

  function deleteReport(id) {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => loadDrafts();
  }

  function getTypeIcon(type) {
    const icons = {
      mk: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>`,
      mm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`,
      ma: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/></svg>`
    };
    return icons[type] || icons.mk;
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function selectType(type) {
    selectedType = type;
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`.type-btn[data-type="${type}"]`).classList.add('selected');
    document.getElementById('input-type').value = type;
    renderEquipmentConfig(type);
    updateConfigButton();
  }

  function renderEquipmentConfig(type) {
    const config = TYPE_CONFIGS[type];
    if (!config) return;

    const container = document.getElementById('equipment-config');
    equipmentCounts = {};

    container.innerHTML = config.equipment.map(eq => {
      equipmentCounts[eq.id] = 0;
      return `
        <div class="equipment-row">
          <div class="equipment-icon">${EQUIPMENT_ICONS[eq.id] || ''}</div>
          <div class="equipment-name">${eq.name}</div>
          <div class="equipment-count">
            <button type="button" class="count-btn" data-eq="${eq.id}" data-action="dec">-</button>
            <input type="number" id="eq-${eq.id}" value="0" min="0" data-eq="${eq.id}">
            <button type="button" class="count-btn" data-eq="${eq.id}" data-action="inc">+</button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.count-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(`eq-${btn.dataset.eq}`);
        let val = parseInt(input.value) || 0;
        val = btn.dataset.action === 'inc' ? val + 1 : Math.max(0, val - 1);
        input.value = val;
        equipmentCounts[btn.dataset.eq] = val;
        updateConfigButton();
      });
    });

    container.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', () => {
        let val = Math.max(0, parseInt(input.value) || 0);
        input.value = val;
        equipmentCounts[input.dataset.eq] = val;
        updateConfigButton();
      });
    });
  }

  function hasEquipment() {
    return Object.values(equipmentCounts).some(v => v > 0);
  }

  function updateConfigButton() {
    const name = document.getElementById('input-object-name').value.trim();
    document.getElementById('btn-config-next').disabled = !(selectedType && name && hasEquipment());
  }

  function renderConfigSummary() {
    const config = TYPE_CONFIGS[selectedType];
    const name = document.getElementById('input-object-name').value;
    let total = 0;

    let html = `<div class="config-summary-title">${config.name} - ${name}</div>`;

    config.equipment.forEach(eq => {
      const count = equipmentCounts[eq.id] || 0;
      if (count > 0) {
        total += count;
        html += `<div class="config-summary-item"><span>${eq.name}</span><span>${count}</span></div>`;
      }
    });

    if (config.hasProchee) {
      total++;
      html += `<div class="config-summary-item"><span>Прочее</span><span>1</span></div>`;
    }

    html += `<div class="config-summary-total">Всего: ${total}</div>`;
    document.getElementById('config-summary').innerHTML = html;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('input-object-name').value.trim();
    if (!name || !selectedType || !hasEquipment()) return showToast('Заполните все поля');

    const sections = generateSections(selectedType, equipmentCounts);

    currentReport = {
      id: generateId(),
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      status: 'draft',
      reportName: name,
      objectType: selectedType,
      equipmentCounts: { ...equipmentCounts },
      date: document.getElementById('input-date').value,
      technician: document.getElementById('input-technician').value,
      comment: document.getElementById('input-comment').value,
      sections: sections,
      keCodes: []
    };

    saveReport();
    showChecklist();
  }

  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      saveReport();
      showToast('Сохранено');
    }, 2000);
  }

  function saveReport() {
    if (!currentReport) return;
    currentReport.modified = new Date().toISOString();
    db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(currentReport);
  }

  function showChecklist() {
    showPage('checklist');
    document.getElementById('checklist-title').textContent = currentReport.reportName;
    document.getElementById('checklist-meta').textContent = `${currentReport.technician} - ${formatDate(currentReport.date)}`;
    updateProgress();
    renderSectionsChecklist();
  }

  function updateProgress() {
    let done = 0, total = 0;
    currentReport.sections.forEach(sec => {
      sec.photoTypes.forEach(pt => {
        total++;
        if (sec.photos.some(p => p.typeId === pt.id)) done++;
      });
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById('progress-fill').style.width = `${pct}%`;
    document.getElementById('progress-text').textContent = `${pct}% (${done}/${total})`;

    const statusEl = document.getElementById('finish-status');
    statusEl.textContent = `Готовность: ${pct}% (${done}/${total} фото)`;
    statusEl.className = pct === 100 ? 'finish-status success' : 'finish-status';
  }

  function renderSectionsChecklist() {
    const container = document.getElementById('sections-checklist');

    container.innerHTML = currentReport.sections.map((sec, i) => {
      let done = 0, total = sec.photoTypes.length;
      sec.photoTypes.forEach(pt => {
        if (sec.photos.some(p => p.typeId === pt.id)) done++;
      });
      const statusClass = done === total ? 'completed' : done > 0 ? 'in-progress' : '';

      return `
        <div class="checklist-item ${statusClass}" data-index="${i}">
          <div class="checklist-icon">${SECTION_ICONS[sec.type] || SECTION_ICONS.prochee}</div>
          <div class="checklist-info">
            <div class="checklist-name">${sec.name}</div>
            <div class="checklist-status">${done === total ? 'Готово' : `${done}/${total}`}</div>
          </div>
          <div class="checklist-check">
            ${done === total ?
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' :
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>'}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.checklist-item').forEach(item => {
      item.addEventListener('click', () => {
        currentSectionIndex = parseInt(item.dataset.index);
        showPhotoSection();
      });
    });
  }

  function showPhotoSection() {
    showPage('photos');
    const section = currentReport.sections[currentSectionIndex];

    document.getElementById('photos-section-title').textContent = section.name;
    document.getElementById('photos-section-subtitle').textContent = `Выберите тип и сделайте фото`;

    renderPhotoTypes(section);
    renderSectionPhotos(section);
  }

  function renderPhotoTypes(section) {
    const container = document.getElementById('required-list');
    const keTypes = section.photoTypes.filter(pt => pt.isKE);
    const regularTypes = section.photoTypes.filter(pt => !pt.isKE);

    let html = '<div class="photo-types-group"><h4>Фото</h4>';
    regularTypes.forEach(pt => {
      const photoCount = section.photos.filter(p => p.typeId === pt.id).length;
      const isMulti = pt.multi === true;
      const maxPhotos = pt.maxPhotos || (isMulti ? 4 : 1);
      const isComplete = photoCount >= maxPhotos;
      const isSelected = selectedPhotoType === pt.id && !isComplete;
      
      html += `
        <div class="photo-type-item ${isComplete ? 'done' : ''} ${isSelected ? 'selected' : ''}" data-type-id="${pt.id}">
          <div class="photo-type-check">${isComplete ?
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' :
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg>'}</div>
          <div class="photo-type-name">${pt.filename}</div>
          <div class="photo-type-tap-hint">${isMulti ? `${photoCount}/${maxPhotos}` : (isComplete ? '✓' : isSelected ? 'Нажмите' : 'Нажмите')}</div>
        </div>
      `;
    });
    html += '</div>';

    if (keTypes.length > 0) {
      html += '<div class="photo-types-group ke-group"><h4>КЕ (инвентарные номера)</h4>';
      keTypes.forEach(pt => {
        const hasPhoto = section.photos.some(p => p.typeId === pt.id);
        const isSelected = selectedPhotoType === pt.id && !hasPhoto;
        html += `
          <div class="photo-type-item ke-type ${hasPhoto ? 'done' : ''} ${isSelected ? 'selected' : ''}" data-type-id="${pt.id}">
            <div class="photo-type-check">${hasPhoto ?
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' :
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'}</div>
            <div class="photo-type-name">${pt.filename}</div>
            <div class="photo-type-tap-hint">${hasPhoto ? '✓' : isSelected ? 'Нажмите' : 'Нажмите'}</div>
          </div>
        `;
      });
      html += '</div>';
    }

    container.innerHTML = html;

    container.querySelectorAll('.photo-type-item').forEach(item => {
      item.addEventListener('click', () => {
        const typeId = item.dataset.typeId;
        const pt = section.photoTypes.find(t => t.id === typeId);
        const photoCount = section.photos.filter(p => p.typeId === typeId).length;
        const isMulti = pt?.multi === true;
        const maxPhotos = isMulti ? (pt.maxPhotos || 4) : 1;
        
        if (photoCount >= maxPhotos) return;
        
        selectedPhotoType = typeId;
        container.querySelectorAll('.photo-type-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        
        document.getElementById('camera-input').click();
      });
    });

    if (regularTypes.length > 0 && !selectedPhotoType) {
      selectedPhotoType = regularTypes[0].id;
      container.querySelector(`.photo-type-item[data-type-id="${selectedPhotoType}"]`)?.classList.add('selected');
    }
  }

  function renderSectionPhotos(section) {
    const container = document.getElementById('photo-grid-edit');

    let html = section.photos.map((p, i) => {
      const pt = section.photoTypes.find(t => t.id === p.typeId);
      let typeName = pt?.name || 'Фото';
      if (pt?.multi && p.photoNumber > 1) {
        typeName += ` (${p.photoNumber})`;
      }
      return `
        <div class="photo-item" data-index="${i}">
          <img src="${p.dataUrl}" alt="">
          <button class="photo-item-delete" data-index="${i}"></button>
          <div class="photo-type-label">${typeName}</div>
        </div>
      `;
    }).join('');

    html += '<div class="photo-add" id="add-photo-btn"></div>';
    container.innerHTML = html;

    document.getElementById('add-photo-btn').addEventListener('click', () => {
      if (!selectedPhotoType) return showToast('Выберите тип фото');
      const pt = section.photoTypes.find(t => t.id === selectedPhotoType);
      const typePhotos = section.photos.filter(p => p.typeId === selectedPhotoType).length;
      const isMulti = pt?.multi === true;
      const maxPhotos = isMulti ? (pt.maxPhotos || 4) : 1;
      if (typePhotos >= maxPhotos) {
        showToast(`Максимум ${maxPhotos} фото`);
        return;
      }
      document.getElementById('camera-input').click();
    });

    container.querySelectorAll('.photo-item-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        section.photos.splice(parseInt(btn.dataset.index), 1);
        renderSectionPhotos(section);
        renderPhotoTypes(section);
        scheduleAutoSave();
      });
    });
  }

  function handleCameraCapture(e) {
    const file = e.target.files[0];
    if (file) processImage(file);
    e.target.value = '';
  }

  function handleGallerySelect(e) {
    Array.from(e.target.files).forEach(file => processImage(file));
    e.target.value = '';
  }

  function processImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1920;
        let w = img.width, h = img.height;
        if (w > h && w > maxSize) { h = h * maxSize / w; w = maxSize; }
        else if (h > maxSize) { w = w * maxSize / h; h = maxSize; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);

        const section = currentReport.sections[currentSectionIndex];
        const photoNumber = section.photos.filter(p => p.typeId === selectedPhotoType).length + 1;
        
        section.photos.push({
          id: generateId(),
          typeId: selectedPhotoType,
          photoNumber: photoNumber,
          dataUrl: canvas.toDataURL('image/jpeg', 0.85),
          timestamp: new Date().toISOString()
        });

        renderSectionPhotos(section);
        renderPhotoTypes(section);
        scheduleAutoSave();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function saveCurrentSection() {
    const section = currentReport.sections[currentSectionIndex];
    const missing = section.photoTypes.filter(pt => {
      const count = section.photos.filter(p => p.typeId === pt.id).length;
      const required = 1;
      return count < required;
    });

    if (missing.length > 0) {
      showToast(`Не сделаны: ${missing[0].name}`);
      return;
    }

    saveReport();
    updateProgress();
    renderSectionsChecklist();
    showPage('checklist');
    showToast('Секция сохранена');
  }

  async function openKEScanner() {
    showPage('ke');
    const section = currentReport.sections[currentSectionIndex];

    try {
      stopScanner();
      const video = document.getElementById('ke-video');
      const frame = document.getElementById('ke-frame');
      const codeText = document.getElementById('ke-code-text');
      const detectedBox = document.getElementById('ke-detected-code');
      const scanLine = document.getElementById('ke-scan-line');

      videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = videoStream;
      lastScannedCode = null;
      scanCooldown = false;

      if ('BarcodeDetector' in window) {
        const det = new BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e', 'codabar', 'itf', 'data_matrix', 'pdf417']
        });
        scanTimer = setInterval(async () => {
          if (scanCooldown || video.readyState < 2) return;
          try {
            const codes = await det.detect(video);
            if (codes.length) onScanDetected(codes[0].rawValue);
          } catch(e) {}
        }, 300);
      } else if (typeof ZXing !== 'undefined') {
        const hints = new Map();
        hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
          ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8,
          ZXing.BarcodeFormat.CODE_128, ZXing.BarcodeFormat.CODE_39,
          ZXing.BarcodeFormat.QR_CODE, ZXing.BarcodeFormat.UPC_A,
          ZXing.BarcodeFormat.DATA_MATRIX, ZXing.BarcodeFormat.ITF
        ]);
        codeReader = new ZXing.MultiFormatReader();
        codeReader.setHints(hints);

        const cv = document.createElement('canvas');
        cv.style.display = 'none';
        cv.id = 'zxing-cv';
        document.body.appendChild(cv);
        const ctx = cv.getContext('2d');

        scanTimer = setInterval(() => {
          if (scanCooldown || video.readyState < 2) return;
          try {
            cv.width = video.videoWidth;
            cv.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const imgData = ctx.getImageData(0, 0, cv.width, cv.height);
            const lum = new ZXing.RGBLuminanceSource(imgData.data, cv.width, cv.height);
            const bmp = new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(lum));
            const result = codeReader.decode(bmp);
            if (result) onScanDetected(result.getText());
          } catch(e) {}
        }, 400);
      } else {
        showToast('Сканер не поддерживается — используйте ручной ввод');
      }

      renderKEList();
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        showToast('Разрешите доступ к камере в браузере');
      } else {
        showToast('Камера недоступна: ' + err.message);
      }
    }
  }

  function onScanDetected(code) {
    if (scanCooldown) return;
    const clean = code.replace(/[^0-9]/g, '');
    if (clean.length !== 13 && clean.length !== 4) {
      return;
    }
    if (lastScannedCode === code) return;
    lastScannedCode = code;

    scanCooldown = true;
    setTimeout(() => { scanCooldown = false; lastScannedCode = null; }, 2000);

    if (navigator.vibrate) navigator.vibrate(60);
    beepFeedback();

    const frame = document.getElementById('ke-frame');
    const detectedBox = document.getElementById('ke-detected-code');
    const codeText = document.getElementById('ke-code-text');

    if (frame) frame.classList.add('detected');
    if (detectedBox) detectedBox.classList.add('detected');
    if (codeText) codeText.textContent = code;

    showToast('✓ ' + code);
    addKECode(code);
  }

  function beepFeedback() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
      osc.onended = () => ctx.close();
    } catch(e) {}
  }

  function addKECode(code) {
    if (!currentReport) return;
    if (!currentReport.keCodes) currentReport.keCodes = [];
    if (currentReport.keCodes.includes(code)) return;
    currentReport.keCodes.push(code);
    saveReport();
    renderKEList();
  }

  function renderKEList() {
    const container = document.getElementById('ke-items');
    const countSpan = document.getElementById('ke-count');
    if (!currentReport || !currentReport.keCodes || !currentReport.keCodes.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-text">Нет кодов КЕ</div></div>';
      if (countSpan) countSpan.textContent = '';
      return;
    }
    if (countSpan) countSpan.textContent = `(${currentReport.keCodes.length})`;
    container.innerHTML = currentReport.keCodes.map((code, i) => `
      <div class="ke-item" data-idx="${i}">
        <div class="ke-item-code">${escapeHtml(code)}</div>
        <button class="ke-item-delete"></button>
      </div>
    `).join('');

    container.querySelectorAll('.ke-item-delete').forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(e.target.closest('.ke-item').dataset.idx);
        currentReport.keCodes.splice(idx, 1);
        saveReport();
        renderKEList();
      };
    });
  }

  function removeKECode(index) {
    if (!currentReport || !currentReport.keCodes) return;
    currentReport.keCodes.splice(index, 1);
    saveReport();
    renderKEList();
  }

  function renderKESectionList(section) {
    const container = document.getElementById('ke-items');
    const keTypes = section.photoTypes.filter(pt => pt.isKE);
    const kePhotos = section.photos.filter(p => keTypes.some(kt => kt.id === p.typeId));

    if (!kePhotos.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-text">Нет фото КЕ</div></div>';
      return;
    }

    container.innerHTML = kePhotos.map((p, i) => {
      const type = keTypes.find(kt => kt.id === p.typeId);
      return `
        <div class="ke-item">
          <div class="ke-item-code">${type?.name || 'КЕ'}</div>
          <img class="ke-item-photo" src="${p.dataUrl}" alt="">
        </div>
      `;
    }).join('');
  }

  function handleKEGallery(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const section = currentReport.sections[currentSectionIndex];
    const keTypes = section.photoTypes.filter(pt => pt.isKE);

    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 1920;
          let w = img.width, h = img.height;
          if (w > h && w > maxSize) { h = h * maxSize / w; w = maxSize; }
          else if (h > maxSize) { w = w * maxSize / h; h = maxSize; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);

          const availableType = keTypes.find(kt => !section.photos.some(p => p.typeId === kt.id));
          if (availableType) {
            section.photos.push({
              id: generateId(),
              typeId: availableType.id,
              dataUrl: canvas.toDataURL('image/jpeg', 0.85),
              timestamp: new Date().toISOString()
            });
            renderKESectionList(section);
            renderPhotoTypes(section);
            scheduleAutoSave();
          }
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  }

  function stopScanner() {
    if (scanTimer) { clearInterval(scanTimer); scanTimer = null; }
    if (codeReader) { codeReader.reset(); codeReader = null; }
    if (videoStream) { videoStream.getTracks().forEach(t => t.stop()); videoStream = null; }
    const cv = document.getElementById('zxing-cv');
    if (cv) cv.remove();
  }

  function finishReport() {
    currentReport.status = 'completed';
    currentReport.completedAt = new Date().toISOString();
    saveReport();
    showComplete();
  }

  function showComplete() {
    showPage('complete');
    const loadingEl = document.getElementById('complete-loading');
    const actionsEl = document.querySelector('.complete-actions');
    loadingEl.classList.add('show');
    actionsEl.classList.add('hidden');
    buildZipBlob().then(blob => {
      cachedBlob = blob;
      cachedFilename = `${currentReport.reportName || 'report'}_${currentReport.date || ''}.zip`;
      loadingEl.classList.remove('show');
      actionsEl.classList.remove('hidden');
    }).catch(() => {
      loadingEl.classList.remove('show');
      actionsEl.classList.remove('hidden');
    });
    let totalPhotos = 0;
    let doneTypes = 0;
    let totalTypes = 0;
    currentReport.sections.forEach(sec => {
      totalPhotos += sec.photos.length;
      sec.photoTypes.forEach(pt => {
        totalTypes++;
        if (sec.photos.some(p => p.typeId === pt.id)) doneTypes++;
      });
    });

    document.getElementById('complete-stats').innerHTML = `
      <div class="stat"><div class="stat-value">${currentReport.sections.length}</div><div class="stat-label">Секций</div></div>
      <div class="stat"><div class="stat-value">${totalPhotos}</div><div class="stat-label">Фото</div></div>
      <div class="stat"><div class="stat-value">${Math.round((doneTypes/totalTypes)*100)}%</div><div class="stat-label">Готово</div></div>
    `;
  }

  function getXlsxFilename() {
    const fmt = currentReport.objectType.toUpperCase();
    const obj = currentReport.reportName || '';
    const tech = currentReport.technician || '';
    return `${fmt} ${obj} ЧЛ ТО ${fmt} (${tech}) .xlsx`;
  }

  function generateXlsxData() {
    const ws_data = [];

    ws_data.push(['Объект', currentReport.reportName || '']);
    ws_data.push(['Формат', currentReport.objectType.toUpperCase()]);
    ws_data.push(['Дата', currentReport.date || '']);
    ws_data.push(['Провел', currentReport.technician || '']);
    ws_data.push([null]);
    ws_data.push(['Конфигурация объекта', '']);

    const eqMap = {
      'kassa': 'Касса',
      'kassa_zona': 'Кассовая зона',
      'kso': 'Касса самообслуживания',
      'td': 'ТД',
      'tsd': 'ТСД',
      'uks': 'Универсальный кассовый стол (УКС)',
      'vesi': 'Весы',
      'mp': 'Мобильный принтер'
    };

    for (const [eqId, eqName] of Object.entries(eqMap)) {
      if (currentReport.equipmentCounts && currentReport.equipmentCounts[eqId]) {
        ws_data.push([eqName, String(currentReport.equipmentCounts[eqId])]);
      }
    }

    ws_data.push([null]);
    ws_data.push(['№', 'Блок', 'Наименование работ', 'Статус', 'Комментарий']);

    let itemNum = 0;
    const sections = currentReport.sections || [];

    for (const sec of sections) {
      if (!sec.photos || sec.photos.length === 0) continue;

      ws_data.push([sec.name || '']);

      const sortedPhotos = [...sec.photos].sort((a, b) => {
        const typeA = sec.photoTypes.find(t => t.id === a.typeId);
        const typeB = sec.photoTypes.find(t => t.id === b.typeId);
        const nameA = typeA ? typeA.name : '';
        const nameB = typeB ? typeB.name : '';
        return nameA.localeCompare(nameB);
      });

      for (const photo of sortedPhotos) {
        const pt = sec.photoTypes.find(t => t.id === photo.typeId);
        if (!pt) continue;

        itemNum++;
        let filename = pt.filename;
        if (pt.multi && photo.photoNumber > 1) {
          filename = filename.replace('.jpg', ` ${photo.photoNumber}.jpg`);
        }

        ws_data.push([
          String(itemNum),
          sec.name || '',
          filename.replace('.jpg', ''),
          'OK',
          'нет замечаний'
        ]);
      }
    }

    return ws_data;
  }

  async function downloadArchive() {
    showToast('Создание архива...');
    try {
      const blob = cachedBlob || await buildZipBlob();
      const filename = cachedFilename || `${currentReport.reportName || 'report'}_${currentReport.date || ''}.zip`;
      downloadBlob(blob, filename);
      showToast('Архив скачан');
    } catch (e) {
      showToast('Ошибка: ' + e.message);
    }
  }

  function generateReportJSON() {
    const photos = [];
    currentReport.sections.forEach(sec => {
      sec.photos.forEach(photo => {
        const pt = sec.photoTypes.find(t => t.id === photo.typeId);
        if (pt) {
          let filename = pt.filename;
          if (pt.multi && photo.photoNumber > 1) {
            filename = filename.replace('.jpg', ` ${photo.photoNumber}.jpg`);
          }
          photos.push({
            section: sec.name,
            filename: filename,
            type: pt.isKE ? 'КЕ' : 'фото',
            timestamp: photo.timestamp
          });
        }
      });
    });

    return {
      id: currentReport.id,
      object: currentReport.reportName,
      type: currentReport.objectType,
      date: currentReport.date,
      technician: currentReport.technician,
      comment: currentReport.comment,
      summary: {
        sections: currentReport.sections.length,
        totalPhotos: photos.length
      },
      photos: photos
    };
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function sendEmail() {
    doShareOrDownload();
  }

  function shareReport() {
    doShareOrDownload();
  }

  function tryShare(blob, filename) {
    const file = new File([blob], filename, { type: 'application/zip' });
    const shareData = {
      title: `Фотоотчёт: ${currentReport.reportName || 'report'}`,
      text: `${currentReport.reportName} | ${currentReport.technician}`
    };
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      shareData.files = [file];
    }
    navigator.share(shareData).catch(e => {
      if (e.name !== 'AbortError') {
        showToast('Приложение не поддерживает файл — сохраните и отправьте вручную');
      }
    });
  }

  async function doShareOrDownload() {
    if (!cachedBlob) {
      showToast('Дождитесь подготовки архива');
      return;
    }
    if (!navigator.share) {
      showToast('Отправка недоступна в этом браузере');
      return;
    }
    tryShare(cachedBlob, cachedFilename);
  }

  async function buildZipBlob() {
    const zip = new JSZip();

    const ws_data = generateXlsxData();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 10 }, { wch: 35 }, { wch: 55 }, { wch: 12 }, { wch: 25 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Отчет по ТО');
    const xlsx_buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    zip.file(getXlsxFilename(), xlsx_buf);

    zip.file('report.json', JSON.stringify(generateReportJSON(), null, 2));

    let itemNum = 0;
    let photoCount = 0;
    for (const sec of currentReport.sections) {
      for (const photo of sec.photos) {
        const pt = sec.photoTypes.find(t => t.id === photo.typeId);
        if (!pt) continue;
        itemNum++;
        photoCount++;
        const base64 = photo.dataUrl.split(',')[1];
        let filename = pt.filename;
        if (pt.multi && photo.photoNumber > 1) {
          filename = filename.replace('.jpg', ` ${photo.photoNumber}.jpg`);
        }
        if (pt.isKE) {
          zip.file(`КЕ/${filename}`, base64, { base64: true });
        } else {
          zip.file(`${itemNum}# ${filename}`, base64, { base64: true });
        }
      }
    }

    const keCodes = currentReport.sections.reduce((acc, sec) => {
      const kePhotos = sec.photos.filter(p => {
        const pt = sec.photoTypes.find(t => t.id === p.typeId);
        return pt && pt.isKE;
      });
      return acc + kePhotos.length;
    }, 0);

    const lines = [`Фото Отчёт — ${currentReport.reportName}`, `Дата: ${currentReport.date}`, `Техник: ${currentReport.technician}`, '', `Всего фото: ${photoCount}`, `КЕ фото: ${keCodes}`, `КЕ кодов: ${currentReport.keCodes ? currentReport.keCodes.length : 0}`, ''];
    if (currentReport.keCodes && currentReport.keCodes.length > 0) {
      lines.push('КЕ коды:');
      currentReport.keCodes.forEach(code => lines.push(`  ${code}`));
    }
    zip.file('КЕ.txt', lines.join('\n'));

    return await zip.generateAsync({ type: 'blob' });
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  document.getElementById('input-object-name').addEventListener('input', updateConfigButton);

  init();
})();
