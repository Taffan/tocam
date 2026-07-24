(function() {
  'use strict';

  let APP_VERSION = localStorage.getItem('appVersion') || '1.0.5.6';

  const verEl = document.getElementById('settings-version-number');
  if (verEl) verEl.textContent = APP_VERSION;

  fetch('version.json?t=' + Date.now(), { cache: 'no-cache' })
    .then(r => r.json())
    .then(data => {
      const remoteVer = String(data.version || APP_VERSION);
      if (remoteVer !== APP_VERSION) {
        APP_VERSION = remoteVer;
        localStorage.setItem('appVersion', APP_VERSION);
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) reg.update();
          }).catch(() => {});
        }
      }
      const verEl2 = document.getElementById('settings-version-number');
      if (verEl2) verEl2.textContent = APP_VERSION;
    })
    .catch(() => {});

  const DB_NAME = 'PhotoReportsDB_v6';
  const STORE_NAME = 'reports';

  let db = null;
  window.currentReport = null;
  window.currentSectionIndex = null;
  let selectedPhotoType = null;
  let selectedType = null;
  let galleryPreviewActive = false;
  let equipmentCounts = {};
  let videoStream = null;
  let autoSaveTimer = null;
  let scanCooldown = false;
  let scanTimer = null;
  let pendingScanCode = null;
  let detectFailCount = 0;
  let torchOn = false;
  let deferredPrompt = null;
  let _updateBubble = null;
  let longPressTimer = null;
  let longPressActivated = false;
  let longPressTypeId = null;
  function clearLongPress() {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    longPressActivated = false;
  }
  function clearLongPressTimer() {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
  }
  let _swReg = null;
  let _updatePendingReload = false;
  let pageHistory = ['home'];
  let currentPage = 'home';
  let cachedZipBlob = null;
  let reportDiscarded = false;

  function init() {
    initDB().then(() => {
      loadDrafts();
      setupEventListeners();
      setDefaultDate();
      setupInstallPrompt();
      checkForUpdates();
      showPage('home');
    }).catch(() => {
      db = createDummyDB();
      loadDrafts();
      setupEventListeners();
      setDefaultDate();
      showPage('home');
    });
  }

  function initDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        db = createDummyDB();
        resolve(db);
        return;
      }
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => { db = createDummyDB(); resolve(db); };
      request.onsuccess = () => { db = request.result; resolve(db); };
      request.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  function createDummyDB() {
    const storage = {};
    return {
      transaction: () => ({
        objectStore: () => ({
          getAll: () => ({ onsuccess: null, result: Object.values(storage) }),
          get: (id) => ({ onsuccess: null, result: storage[id] }),
          put: (item) => { storage[item.id] = item; },
          delete: (id) => { delete storage[id]; }
        })
      })
    };
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

  function showUpdateUI(newVersion) {
    _updateBubble = newVersion;
    document.getElementById('update-bubble').classList.remove('hidden');
    document.getElementById('menu-update').classList.remove('hidden');
  }

  function checkForUpdates() {
    if ('serviceWorker' in navigator) {
      const doSWCheck = reg => {
        _swReg = reg;
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing || reg.waiting;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateUI();
            }
          });
        });
        if (reg.waiting && navigator.serviceWorker.controller) {
          showUpdateUI();
        }
        reg.update();
      };
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) { doSWCheck(reg); return; }
        navigator.serviceWorker.register('./sw.js', { scope: './' }).then(doSWCheck).catch(() => {});
      }).catch(() => {});
    }
    const t = Date.now();
    fetch('version.json?t=' + t, { cache: 'no-cache' })
      .then(r => r.json())
      .then(data => {
        const remoteVer = String(data.version);
        const localVer = localStorage.getItem('appVersion');
        if (!localVer) { localStorage.setItem('appVersion', remoteVer); return; }
        if (remoteVer !== localVer) showUpdateUI(remoteVer);
      })
      .catch(() => {});
  }

  function hideUpdateUI() {
    document.getElementById('update-bubble').classList.add('hidden');
    document.getElementById('menu-update').classList.add('hidden');
    _updateBubble = null;
  }

  function performUpdate() {
    if (!navigator.onLine) {
      showToast('Обновление недоступно без интернета');
      return;
    }
    document.getElementById('menu-dropdown').classList.add('hidden');
    showToast('Обновление...');
    _updatePendingReload = true;
    const doReload = (ver) => {
      localStorage.setItem('appVersion', String(ver || 1));
      location.reload();
    };
    if (_swReg && _swReg.waiting) {
      _swReg.waiting.postMessage('SKIP_WAITING');
    } else {
      const cleanup = () => {
        if ('caches' in window) {
          caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).finally(() => {
            if (_updateBubble) doReload(_updateBubble);
            else fetch('version.json?t=' + Date.now(), { cache: 'no-cache' }).then(r => r.json()).then(d => doReload(d.version)).catch(() => doReload(1));
          });
        } else {
          if (_updateBubble) doReload(_updateBubble);
          else fetch('version.json?t=' + Date.now(), { cache: 'no-cache' }).then(r => r.json()).then(d => doReload(d.version)).catch(() => doReload(1));
        }
      };
      cleanup();
    }
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data === 'SW_UPDATED') {
        showUpdateUI();
      }
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!_updatePendingReload) return;
      if ('caches' in window) {
        caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).finally(() => {
          localStorage.setItem('appVersion', String(_updateBubble || 1));
          location.reload();
        });
      } else {
        localStorage.setItem('appVersion', String(_updateBubble || 1));
        location.reload();
      }
    });
  }

  function setupEventListeners() {
    if (window.history && window.history.pushState) {
      history.pushState(null, '');
      window.addEventListener('popstate', () => {
        const menu = document.getElementById('menu-dropdown');
        const gallery = document.getElementById('photo-gallery-modal');
        const preview = document.getElementById('photo-preview-modal');
        const scanner = document.getElementById('ke-camera-modal');
        if (menu && !menu.classList.contains('hidden')) {
          menu.classList.add('hidden');
          history.pushState(null, '');
          return;
        }
        if (gallery && !gallery.classList.contains('hidden')) {
          closeGallery();
          history.pushState(null, '');
          return;
        }
        if (preview && !preview.classList.contains('hidden')) {
          closePreview();
          history.pushState(null, '');
          return;
        }
        if (scanner && !scanner.classList.contains('hidden')) {
          closeKEModal();
          history.pushState(null, '');
          return;
        }
        goBack();
      });
    }
    document.getElementById('header-back').addEventListener('click', goBack);
    document.getElementById('header-menu').addEventListener('click', (e) => {
      document.getElementById('menu-dropdown').classList.toggle('hidden');
    });
    document.getElementById('menu-backdrop').addEventListener('click', () => {
      document.getElementById('menu-dropdown').classList.add('hidden');
    });
    document.getElementById('menu-settings').addEventListener('click', () => {
      document.getElementById('menu-dropdown').classList.add('hidden');
      showPage('settings');
    });
    document.getElementById('menu-update').addEventListener('click', performUpdate);
    document.getElementById('update-bubble-close').addEventListener('click', (e) => {
      e.stopPropagation();
      hideUpdateUI();
    });
    document.getElementById('menu-install').addEventListener('click', async () => {
      document.getElementById('menu-dropdown').classList.add('hidden');
      if (deferredPrompt) {
        await deferredPrompt.prompt();
        deferredPrompt = null;
        localStorage.setItem('installPromptShown', 'true');
        document.getElementById('install-prompt')?.classList.add('hidden');
      } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          document.getElementById('ios-install')?.classList.remove('hidden');
        } else {
          showToast('Приложение уже установлено или не поддерживается');
        }
      }
    });
    document.getElementById('btn-new-report').addEventListener('click', () => { cachedZipBlob = null; showPage('config'); });
    document.getElementById('btn-help').addEventListener('click', () => {
      if (currentPage === 'help') showPage(pageHistory.length > 1 ? pageHistory[pageHistory.length - 2] : 'home');
      else showPage('help');
    });

    document.addEventListener('pointerup', clearLongPressTimer);
    document.addEventListener('pointercancel', clearLongPress);
    document.addEventListener('touchend', clearLongPress);
    document.addEventListener('touchcancel', clearLongPress);

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
    document.getElementById('report-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('btn-finish-report').addEventListener('click', () => {
      finishReport();
    });
    document.getElementById('btn-save-section').addEventListener('click', saveCurrentSection);

    document.getElementById('camera-input').addEventListener('change', handleCameraCapture);
    document.getElementById('gallery-input').addEventListener('change', handleGallerySelect);

    document.getElementById('btn-send-report').addEventListener('click', sendReport);
    document.getElementById('btn-delete-report').addEventListener('click', deleteCurrentReport);
    document.getElementById('btn-new-from-complete').addEventListener('click', () => {
      reportDiscarded = true;
      cachedZipBlob = null;
      currentReport = null;
      showPage('home');
    });

    document.getElementById('ke-cam-torch').addEventListener('click', toggleTorch);
    document.getElementById('ke-cam-capture').addEventListener('click', keCamCapture);
    document.getElementById('ke-cam-close').addEventListener('click', closeKEModal);
    document.getElementById('ke-cam-confirm-yes').addEventListener('click', () => {
      const confirmBar = document.getElementById('ke-cam-confirm');
      const overlays = document.getElementById('ke-cam-overlays');
      pendingScanCode = confirmBar.dataset.code || null;
      confirmBar.classList.add('hidden');
      if (overlays) overlays.innerHTML = '';
      const status = document.getElementById('ke-cam-status');
      if (status) {
        status.textContent = 'Отсканируйте выбранный ШК...';
        status.className = 'ke-cam-status';
      }
    });
    document.getElementById('ke-cam-video').addEventListener('click', keCamCapture);

    document.getElementById('preview-ok').addEventListener('click', closePreview);
    document.getElementById('preview-back').addEventListener('click', closePreview);
    document.getElementById('preview-delete').addEventListener('click', () => {
      const section = currentReport.sections[currentSectionIndex];
      deletePreviewPhoto(section);
    });
    document.getElementById('gallery-capture').addEventListener('click', () => {
      document.getElementById('camera-input').click();
    });

    function closeGallery(e) {
      if (e) e.stopPropagation();
      document.getElementById('photo-gallery-modal').classList.add('hidden');
      document.getElementById('photo-preview-modal').classList.add('hidden');
      document.getElementById('preview-image').src = '';
      if (currentGallerySection) {
        renderSectionPhotos(currentGallerySection);
        renderPhotoTypes(currentGallerySection);
        currentGallerySection = null;
      }
    }

    document.getElementById('gallery-ok').addEventListener('click', closeGallery);
    document.getElementById('gallery-close-btn').addEventListener('click', closeGallery);

    // Settings
    function loadSettings() {
      const photoQuality = localStorage.getItem('photoQuality') || 'medium';
      const scannerQuality = localStorage.getItem('scannerQuality') || 'medium';
      const darkTheme = localStorage.getItem('darkTheme') === 'true';
      const savedTechnician = localStorage.getItem('technician') || '';

      document.querySelectorAll('input[name="photoQuality"]').forEach(r => {
        r.checked = r.value === photoQuality;
      });
      document.querySelectorAll('input[name="scannerQuality"]').forEach(r => {
        r.checked = r.value === scannerQuality;
      });
      document.getElementById('settings-dark-theme').checked = darkTheme;
      const techInput = document.getElementById('settings-technician');
      if (techInput) techInput.value = savedTechnician;

      document.documentElement.classList.toggle('dark', darkTheme);
    }

    function saveSetting(key, value) {
      localStorage.setItem(key, value);
    }

    document.querySelectorAll('.settings-radio input').forEach(r => {
      r.addEventListener('change', () => {
        saveSetting(r.dataset.key, r.value);
      });
    });

    document.getElementById('settings-dark-theme').addEventListener('change', (e) => {
      saveSetting('darkTheme', e.target.checked);
      document.documentElement.classList.toggle('dark', e.target.checked);
    });

    const settingsTechInput = document.getElementById('settings-technician');
    if (settingsTechInput) {
      settingsTechInput.addEventListener('input', () => {
        saveSetting('technician', settingsTechInput.value);
      });
    }

    loadSettings();
  }

  function openGallery() {
    document.getElementById('gallery-input').click();
  }

  function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(`page-${pageName}`).classList.remove('hidden');
    currentPage = pageName;

    if (pageName === 'home') {
      pageHistory = ['home'];
      loadDrafts();
    } else if (pageName === 'data') {
      const savedTech = localStorage.getItem('technician') || '';
      const input = document.getElementById('input-technician');
      if (input && !input.value) input.value = savedTech;
      if (pageHistory[pageHistory.length - 1] !== pageName) {
        pageHistory.push(pageName);
        if (window.history && window.history.pushState) history.pushState(null, '');
      }
    } else if (pageHistory[pageHistory.length - 1] !== pageName) {
      pageHistory.push(pageName);
      if (window.history && window.history.pushState) history.pushState(null, '');
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
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => loadDrafts();
    request.onerror = () => loadDrafts();
  }

  function getTypeIcon(type) {
    const icons = {
      mk: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>`,
      mm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`,
      mm_uks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`,
      mm_rmd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`,
      ma: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/></svg>`,
      gm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 9V5a4 4 0 00-8 0v4"/><path d="M2 11h20v10H2z"/></svg>`
    };
    return icons[type] || icons.mk;
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function selectType(type) {
    selectedType = type;
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
    const btn = document.querySelector(`.type-btn[data-type="${type}"]`);
    if (btn) btn.classList.add('selected');
    document.getElementById('input-type').value = type;
    renderEquipmentConfig(type);
    updateConfigButton();
    const nameInput = document.getElementById('input-object-name');
    if (nameInput) nameInput.focus();
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
      keCodes: [],
      snCodes: []
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
        if (pt.isKE || pt.isSN) return;
        total++;
        if (sec.photos.some(p => p.typeId === pt.id)) done++;
      });
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById('progress-fill').style.width = `${pct}%`;
    document.getElementById('progress-text').textContent = `${pct}% (${done}/${total} фото)`;

    const statusEl = document.getElementById('finish-status');
    statusEl.textContent = `Готовность: ${pct}% (${done}/${total} фото)`;
    statusEl.className = pct === 100 ? 'finish-status success' : 'finish-status';
  }

  function renderSectionsChecklist() {
    const container = document.getElementById('sections-checklist');

    container.innerHTML = currentReport.sections.map((sec, i) => {
      let done = 0, total = 0;
      sec.photoTypes.forEach(pt => {
        if (pt.isKE || pt.isSN) return;
        total++;
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
    const snTypes = section.photoTypes.filter(pt => pt.isSN);
    const regularTypes = section.photoTypes.filter(pt => !pt.isKE && !pt.isSN);

    let html = '<div class="photo-types-group"><h4>Фото</h4>';
    regularTypes.forEach(pt => {
      const photoCount = section.photos.filter(p => p.typeId === pt.id).length;
      const isMulti = pt.multi === true;
      const maxPhotos = pt.maxPhotos || (isMulti ? 4 : 1);
      const hasPhoto = photoCount > 0;
      const isComplete = photoCount >= maxPhotos;
      const isSelected = selectedPhotoType === pt.id && !isComplete;
      
      const hint = pt.hint || '';
      html += `
        <div class="photo-type-item ${hasPhoto ? 'done' : ''} ${isSelected ? 'selected' : ''}" data-type-id="${pt.id}">
          <div class="photo-type-check">${hasPhoto ?
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' :
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg>'}</div>
          <div class="photo-type-content">
            <div class="photo-type-name">${pt.name}</div>
          </div>
          <div class="photo-type-tap-hint">${isMulti ? `${photoCount}/${maxPhotos}` : (isComplete ? '✓' : isSelected ? 'Нажмите' : 'Нажмите')}</div>
          ${hint ? `<button class="photo-type-hint-btn" data-hint="${hint.replace(/"/g, '&quot;')}" title="Подсказка">?</button>` : ''}
        </div>
      `;
    });
    html += '</div>';

    if (keTypes.length > 0 || snTypes.length > 0) {
      html += '<div class="photo-types-group ke-group ke-sn-split">';
      html += '<div class="ke-sn-header"><span>КЕ (инвентарные номера)</span><span>Серийные номера</span></div>';
      html += '<div class="ke-sn-container">';

      function renderKECell(pt) {
        const hasPhoto = section.photos.some(p => p.typeId === pt.id);
        const isSelected = selectedPhotoType === pt.id && !hasPhoto;
        const btnClass = 'ke-type' + (hasPhoto ? ' done' : '') + (isSelected ? ' selected' : '');
        const hint = pt.hint || '';
        return `<div class="photo-type-item ${btnClass}" data-type-id="${pt.id}">
            <div class="photo-type-check">${hasPhoto ?
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' :
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'}</div>
            <div class="photo-type-content">
              <div class="photo-type-name">${pt.name}</div>
            </div>
            ${hasPhoto ? '<div class="photo-type-tap-hint">✓</div>' : ''}
            ${hint ? `<button class="photo-type-hint-btn" data-hint="${hint.replace(/"/g, '&quot;')}" title="Подсказка">?</button>` : ''}
          </div>`;
      }
      function renderSNCell(pt) {
        const hasPhoto = section.photos.some(p => p.typeId === pt.id);
        const isSelected = selectedPhotoType === pt.id && !hasPhoto;
        const btnClass = 'sn-type' + (hasPhoto ? ' done' : '') + (isSelected ? ' selected' : '');
        const hint = pt.hint || '';
        return `<div class="photo-type-item ${btnClass}" data-type-id="${pt.id}">
            <div class="photo-type-check">${hasPhoto ?
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' :
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'}</div>
            <div class="photo-type-content">
              <div class="photo-type-name">${pt.name}</div>
            </div>
            ${hasPhoto ? '<div class="photo-type-tap-hint">✓</div>' : ''}
            ${hint ? `<button class="photo-type-hint-btn" data-hint="${hint.replace(/"/g, '&quot;')}" title="Подсказка">?</button>` : ''}
          </div>`;
      }

      const maxPairs = Math.max(keTypes.length, snTypes.length);
      for (let i = 0; i < maxPairs; i++) {
        html += '<div class="ke-pair">';
        html += '<div class="ke-sn-column">' + (i < keTypes.length ? renderKECell(keTypes[i]) : '<div class="ke-pair-spacer"></div>') + '</div>';
        html += '<div class="ke-sn-column">' + (i < snTypes.length ? renderSNCell(snTypes[i]) : '<div class="ke-pair-spacer"></div>') + '</div>';
        html += '</div>';
      }

      html += '</div></div>';
    }

    container.innerHTML = html;

      container.querySelectorAll('.photo-type-item').forEach(item => {
        let _preventClick = false;

        item.addEventListener('contextmenu', (e) => e.preventDefault());

        function startLongPress() {
          if (longPressTimer) return;
          longPressActivated = false;
          longPressTypeId = item.dataset.typeId;
          longPressTimer = setTimeout(() => {
            longPressActivated = true;
            _preventClick = true;
            selectedPhotoType = longPressTypeId;
            container.querySelectorAll('.photo-type-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
          }, 1500);
        }

        function cancelLongPress() {
          clearTimeout(longPressTimer);
          longPressTimer = null;
          longPressActivated = false;
          _preventClick = false;
        }

        item.addEventListener('pointerdown', startLongPress, { passive: true });
        item.addEventListener('touchstart', startLongPress, { passive: true });

        item.addEventListener('pointermove', cancelLongPress, { passive: true });
        item.addEventListener('touchmove', cancelLongPress, { passive: true });

        item.addEventListener('pointerup', () => {
          clearTimeout(longPressTimer);
          longPressTimer = null;
          if (longPressActivated) {
            longPressActivated = false;
            openGallery();
          }
        });
        item.addEventListener('touchend', () => {
          clearTimeout(longPressTimer);
          longPressTimer = null;
          if (longPressActivated) {
            longPressActivated = false;
            document.getElementById('gallery-input').click();
          }
        });

        item.addEventListener('pointercancel', cancelLongPress);
        item.addEventListener('touchcancel', cancelLongPress);

        item.addEventListener('click', (e) => {
          if (_preventClick) {
            _preventClick = false;
            e.preventDefault();
            return;
          }
          const typeId = item.dataset.typeId;
          const pt = section.photoTypes.find(t => t.id === typeId);
          // left 60px → gallery (tappable zone for iOS/Android)
          const _r = item.getBoundingClientRect();
          const isGalleryClick = e.clientX && (e.clientX - _r.left) < 60;
          if (isGalleryClick) {
            e.preventDefault();
            selectedPhotoType = typeId;
            container.querySelectorAll('.photo-type-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            openGallery();
            return;
          }
          selectedPhotoType = typeId;
        container.querySelectorAll('.photo-type-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        if (pt?.isKE || pt?.isSN) {
          const photo = section.photos.find(p => p.typeId === typeId);
          if (photo) openPhotoPreview(section, pt, photo);
          else openKEModal();
        } else {
          const existing = section.photos.filter(p => p.typeId === typeId);
          if (existing.length > 0) openPhotoGallery(section, pt);
          else document.getElementById('camera-input').click();
        }
      });
    });

    container.querySelectorAll('.photo-type-hint-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = btn.closest('.photo-type-item');
        const isOpen = item.classList.contains('hint-open');
        document.querySelectorAll('.photo-type-item.hint-open').forEach(el => {
          el.classList.remove('hint-open');
          el.querySelector('.hint-popup')?.remove();
        });
        if (!isOpen) {
          item.classList.add('hint-open');
          const popup = document.createElement('div');
          popup.className = 'hint-popup';
          popup.textContent = btn.dataset.hint;
          item.appendChild(popup);
        }
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
          <button class="photo-item-delete" data-index="${i}">×</button>
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
        if (!confirm('Удалить фото?')) return;
        section.photos.splice(parseInt(btn.dataset.index), 1);
        renderSectionPhotos(section);
        renderPhotoTypes(section);
        scheduleAutoSave();
      });
    });

    container.querySelectorAll('.photo-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.photo-item-delete')) return;
        const idx = parseInt(item.dataset.index);
        const photo = section.photos[idx];
        const pt = section.photoTypes.find(t => t.id === photo.typeId);
        selectedPhotoType = pt.id;
        openPhotoPreview(section, pt, photo);
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

  function getScannerRes() {
    const q = localStorage.getItem('scannerQuality') || 'medium';
    if (q === 'low') return { width: { ideal: 640 }, height: { ideal: 480 } };
    if (q === 'high') return { width: { ideal: 1920 }, height: { ideal: 1080 } };
    return { width: { ideal: 1280 }, height: { ideal: 720 } };
  }

  function getEXIFOrientation(file) {
    return new Promise(resolve => {
      const blob = file.slice(0, 65536);
      const reader = new FileReader();
      reader.onload = () => {
        const view = new DataView(reader.result);
        if (view.getUint16(0, false) !== 0xFFD8) { resolve(1); return; }
        let offset = 2;
        while (offset < view.byteLength - 2) {
          if (view.getUint16(offset, false) === 0xFFE1) {
            const exifLen = view.getUint16(offset + 2, false);
            const exifStart = offset + 4;
            if (exifStart + 8 > view.byteLength) break;
            const exifId = String.fromCharCode(view.getUint8(exifStart), view.getUint8(exifStart + 1), view.getUint8(exifStart + 2), view.getUint8(exifStart + 3), view.getUint8(exifStart + 4), view.getUint8(exifStart + 5));
            if (exifId !== 'Exif\0\0') { offset += 2 + exifLen; continue; }
            const tiffOffset = exifStart + 6;
            const littleEndian = view.getUint16(tiffOffset, false) === 0x4949;
            if (view.getUint16(tiffOffset + 2, littleEndian) !== 0x002A) break;
            const ifdOffset = tiffOffset + view.getUint32(tiffOffset + 4, littleEndian);
            if (ifdOffset + 2 > view.byteLength) break;
            const entries = view.getUint16(ifdOffset, littleEndian);
            for (let i = 0; i < entries; i++) {
              const entryOff = ifdOffset + 2 + i * 12;
              if (entryOff + 12 > view.byteLength) break;
              if (view.getUint16(entryOff, littleEndian) === 0x0112) {
                resolve(view.getUint16(entryOff + 8, littleEndian));
                return;
              }
            }
            break;
          }
          if (view.getUint16(offset, false) === 0xFFD9) break;
          const markerLen = view.getUint16(offset + 2, false);
          if (markerLen < 2) break;
          offset += 2 + markerLen;
        }
        resolve(1);
      };
      reader.readAsArrayBuffer(blob);
    });
  }

  function processImage(file) {
    getEXIFOrientation(file).then(orientation => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // step-down resize for iOS (canvas limit ~4096px)
          let srcW = img.width, srcH = img.height;
          const stepLimit = 4096;
          while (srcW > stepLimit || srcH > stepLimit) {
            const ratio = Math.min(stepLimit / srcW, stepLimit / srcH);
            srcW = Math.round(srcW * ratio);
            srcH = Math.round(srcH * ratio);
          }
          const src = document.createElement('canvas');
          src.width = srcW; src.height = srcH;
          src.getContext('2d').drawImage(img, 0, 0, srcW, srcH);

          const maxDim = 1280;
          function resizeToMax(srcCanvas, w, h) {
            let rW, rH;
            if (w >= h) { rW = maxDim; rH = Math.round(h / w * maxDim); }
            else { rH = maxDim; rW = Math.round(w / h * maxDim); }
            const c = document.createElement('canvas');
            c.width = rW; c.height = rH;
            c.getContext('2d').drawImage(srcCanvas, 0, 0, rW, rH);
            return c;
          }
          let canvas;
          if (orientation > 1) {
            const tmp = document.createElement('canvas');
            tmp.width = srcW; tmp.height = srcH;
            const tctx = tmp.getContext('2d');
            tctx.translate(srcW / 2, srcH / 2);
            if (orientation === 2) tctx.scale(-1, 1);
            else if (orientation === 3) tctx.rotate(Math.PI);
            else if (orientation === 4) tctx.scale(1, -1);
            else if (orientation === 5) { tctx.scale(-1, 1); tctx.rotate(Math.PI / 2); }
            else if (orientation === 6) tctx.rotate(Math.PI / 2);
            else if (orientation === 7) { tctx.scale(-1, 1); tctx.rotate(-Math.PI / 2); }
            else if (orientation === 8) tctx.rotate(-Math.PI / 2);
            tctx.drawImage(src, -srcW / 2, -srcH / 2, srcW, srcH);
            canvas = resizeToMax(tmp, tmp.width, tmp.height);
          } else {
            canvas = resizeToMax(src, srcW, srcH);
          }

        const section = currentReport.sections[currentSectionIndex];
        const photoNumber = section.photos.filter(p => p.typeId === selectedPhotoType).length + 1;
        
        section.photos.push({
          id: generateId(),
          typeId: selectedPhotoType,
          photoNumber: photoNumber,
          dataUrl: canvas.toDataURL('image/jpeg', 0.85),
          timestamp: new Date().toISOString()
        });

        const galleryModal = document.getElementById('photo-gallery-modal');
        if (galleryModal && !galleryModal.classList.contains('hidden')) {
          renderGalleryGrid(section);
        } else {
          renderSectionPhotos(section);
          renderPhotoTypes(section);
        }
        scheduleAutoSave();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    });
  }

  let previewPhotoIdx = -1;
  let currentGallerySection = null;

  function openPhotoPreview(section, pt, photo) {
    previewPhotoIdx = section.photos.indexOf(photo);
    document.getElementById('preview-image').src = photo.dataUrl;
    document.getElementById('preview-back').classList.add('hidden');
    document.getElementById('photo-preview-modal').classList.remove('hidden');
  }

  function galleryPhotoTap(section, pt, photo) {
    previewPhotoIdx = section.photos.indexOf(photo);
    document.getElementById('preview-image').src = photo.dataUrl;
    document.getElementById('preview-back').classList.remove('hidden');
    document.getElementById('photo-preview-modal').classList.remove('hidden');
  }

  function closePreview() {
    document.getElementById('photo-preview-modal').classList.add('hidden');
    document.getElementById('preview-image').src = '';
    if (galleryPreviewActive) {
      galleryPreviewActive = false;
      const galleryModal = document.getElementById('photo-gallery-modal');
      if (galleryModal) {
        galleryModal.classList.remove('hidden');
        if (window.__gallerySection) {
          renderGalleryGrid(window.__gallerySection);
        }
      }
    }
  }

  function deletePreviewPhoto(section) {
    if (previewPhotoIdx < 0 || previewPhotoIdx >= section.photos.length) return;
    if (!confirm('Удалить фото?')) return;
    section.photos.splice(previewPhotoIdx, 1);
    previewPhotoIdx = -1;
    closePreview();
    const galleryModal = document.getElementById('photo-gallery-modal');
    if (galleryModal && !galleryModal.classList.contains('hidden')) {
      renderGalleryGrid(section);
    }
    renderSectionPhotos(section);
    renderPhotoTypes(section);
    scheduleAutoSave();
  }

  function openPhotoGallery(section, pt) {
    currentGallerySection = section;
    window.__gallerySection = section;
    const titleEl = document.getElementById('gallery-title');
    if (titleEl) titleEl.textContent = pt?.name || '';
    renderGalleryGrid(section);
    document.getElementById('photo-gallery-modal').classList.remove('hidden');
  }

  window.__galleryTap = function(photoIdx) {
    const section = window.__gallerySection;
    if (!section) return;
    const photo = section.photos[photoIdx];
    if (!photo) return;
    const pt = section.photoTypes.find(t => t.id === selectedPhotoType);
    galleryPreviewActive = true;
    document.getElementById('photo-gallery-modal').classList.add('hidden');
    galleryPhotoTap(section, pt, photo);
  };

  function renderGalleryGrid(section) {
    const grid = document.getElementById('gallery-grid');
    const photos = section.photos.filter(p => p.typeId === selectedPhotoType);
    const pt = section.photoTypes.find(t => t.id === selectedPhotoType);
    const isMulti = pt?.multi === true;
    const maxPhotos = isMulti ? (pt.maxPhotos || 4) : 1;
    const captureBtn = document.getElementById('gallery-capture');
    if (captureBtn) captureBtn.style.display = (photos.length >= maxPhotos) ? 'none' : '';
    if (!photos.length) {
      grid.innerHTML = '<div class="gallery-empty">Нет фото</div>';
      return;
    }
    grid.innerHTML = photos.map((p, i) => {
      const photoIdx = section.photos.indexOf(p);
      return `
        <div class="gallery-item" data-idx="${i}" data-photo-idx="${photoIdx}" onclick="window.__galleryTap(${photoIdx})">
          <img src="${p.dataUrl}" alt="">
          <button class="gallery-item-delete" data-idx="${i}" data-photo-idx="${photoIdx}">×</button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.gallery-item-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const photoIdx = parseInt(btn.dataset.photoIdx);
        const photo = section.photos[photoIdx];
        if (photo) {
          if (!confirm('Удалить фото?')) return;
          section.photos.splice(photoIdx, 1);
          renderGalleryGrid(section);
          renderSectionPhotos(section);
          renderPhotoTypes(section);
          scheduleAutoSave();
        }
      });
    });
  }

  function saveCurrentSection() {
    const section = currentReport.sections[currentSectionIndex];
    const missing = section.photoTypes.filter(pt => {
      if (pt.isKE || pt.isSN) return false;
      const count = section.photos.filter(p => p.typeId === pt.id).length;
      return count < 1;
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

  async function openKEModal() {
    const modal = document.getElementById('ke-camera-modal');
    const video = document.getElementById('ke-cam-video');
    const frame = document.getElementById('ke-cam-frame');
    const status = document.getElementById('ke-cam-status');
    const overlays = document.getElementById('ke-cam-overlays');
    const confirmBar = document.getElementById('ke-cam-confirm');

    pendingScanCode = null;
    window._zxingDetectedCodes = null;
    cachedOverlayCodes = '';
    modal.classList.remove('hidden');
    if (overlays) overlays.innerHTML = '';
    if (confirmBar) confirmBar.classList.add('hidden');
    if (status) { status.textContent = 'Наведите на штрих-код или сделайте фото'; status.className = 'ke-cam-status'; }
    if (frame) frame.classList.remove('detected');

    try {
      if (scanTimer) { clearInterval(scanTimer); scanTimer = null; }
      if (videoStream) { videoStream.getTracks().forEach(t => t.stop()); }

      videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', ...getScannerRes() } });
      video.srcObject = videoStream;
      try { await video.play(); } catch(e) {}
      scanCooldown = false;

      if ('BarcodeDetector' in window) {
        try {
          const desiredFormats = ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e', 'codabar', 'itf', 'data_matrix', 'pdf417'];
          const supportedFormats = await BarcodeDetector.getSupportedFormats();
          const formats = desiredFormats.filter(f => supportedFormats.includes(f));
          const det = new BarcodeDetector({ formats: formats.length ? formats : desiredFormats });
          detectFailCount = 0;
          scanTimer = setInterval(async () => {
            if (scanCooldown || video.readyState < 2 || !video.videoWidth) return;
            try {
              const codes = await det.detect(video);
              detectFailCount = 0;
              if (pendingScanCode) {
                updateTrackingUI(codes.some(c => c.rawValue === pendingScanCode));
              } else {
                showBarcodeOverlays(codes, video.videoWidth, video.videoHeight);
              }
            } catch(e) {
              detectFailCount++;
              if (detectFailCount > 10) {
                clearInterval(scanTimer); scanTimer = null;
                if (typeof ZXing !== 'undefined') initZXingScanner(video);
                else showToast('Сканер не поддерживается — используйте фото');
              }
            }
          }, 300);
        } catch(e) {
          if (typeof ZXing !== 'undefined') initZXingScanner(video);
          else showToast('Сканер не поддерживается — используйте фото');
        }
      } else if (typeof ZXing !== 'undefined') {
        initZXingScanner(video);
      } else {
        showToast('Сканер не поддерживается — используйте фото');
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        showToast('Разрешите доступ к камере в браузере');
      } else {
        showToast('Камера недоступна: ' + err.message);
      }
      closeKEModal();
    }
  }

  let cachedOverlayCodes = '';

  function isKECode(code) {
    const clean = code.replace(/[^0-9]/g, '');
    return clean.length === 13 || clean.length === 4;
  }

  function showBarcodeOverlays(codes, vw, vh) {
    if (pendingScanCode) return;
    const confirmBar = document.getElementById('ke-cam-confirm');
    if (confirmBar && !confirmBar.classList.contains('hidden')) return;
    const container = document.getElementById('ke-cam-overlays');
    if (!container) return;
    const pt = currentReport.sections[currentSectionIndex]?.photoTypes.find(t => t.id === selectedPhotoType);
    const isSN = pt?.isSN;
    const detected = codes.filter(c => {
      if (!c.rawValue || !c.rawValue.trim()) return false;
      if (isSN) return true;
      return isKECode(c.rawValue);
    });
    const codeSet = detected.map(c => c.rawValue).sort().join('|');
    if (!detected.length) {
      if (cachedOverlayCodes !== '') { container.innerHTML = ''; cachedOverlayCodes = ''; }
      return;
    }
    if (codeSet === cachedOverlayCodes) return;
    cachedOverlayCodes = codeSet;
    const wrap = container.parentElement;
    const cw = wrap.clientWidth;
    const ch = wrap.clientHeight;
    if (!cw || !ch) return;
    const scaleX = cw / vw;
    const scaleY = ch / vh;
    let html = '';
    detected.forEach((c, i) => {
      let bx = c.boundingBox;
      if (!bx || typeof bx.x !== 'number') {
        bx = { x: vw * 0.2, y: vh * 0.35, width: vw * 0.6, height: vh * 0.3 };
      }
      const left = Math.max(0, bx.x * scaleX);
      const top = Math.max(0, bx.y * scaleY);
      const w = Math.min(cw - left, bx.width * scaleX);
      const h = Math.min(ch - top, bx.height * scaleY);
      html += `<div class="ke-cam-overlay-box" data-code="${c.rawValue}" style="left:${left}px;top:${top}px;width:${w}px;height:${h}px"><span class="ke-cam-overlay-label">${i+1}: ${c.rawValue}</span></div>`;
    });
    container.innerHTML = html;
    container.querySelectorAll('.ke-cam-overlay-box').forEach(el => {
      el.addEventListener('click', () => {
        const code = el.dataset.code;
        selectBarcodeCode(code);
      });
    });
  }

  function initZXingScanner(video) {
    const hints = new Map();
    hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
      ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8,
      ZXing.BarcodeFormat.CODE_128, ZXing.BarcodeFormat.CODE_39,
      ZXing.BarcodeFormat.QR_CODE, ZXing.BarcodeFormat.UPC_A,
      ZXing.BarcodeFormat.DATA_MATRIX, ZXing.BarcodeFormat.ITF
    ]);
    window._zxingBrowserReader = new ZXing.BrowserMultiFormatReader(hints, 400);
    window._zxingDetectedCodes = new Map();
    window._zxingOverlayTimer = setInterval(renderZXingOverlays, 500);
    window._zxingBrowserReader.decodeFromVideoElementContinuously(video, (result, err) => {
      if (result) {
        const code = result.getText();
        if (pendingScanCode) {
          updateTrackingUI(code === pendingScanCode);
        } else if (code) {
          const pt = currentReport.sections[currentSectionIndex]?.photoTypes.find(t => t.id === selectedPhotoType);
          if (pt?.isSN || isKECode(code)) {
            window._zxingDetectedCodes.set(code, Date.now());
          }
        }
      } else if (pendingScanCode) {
        updateTrackingUI(false);
      }
    });
  }

  function renderZXingOverlays() {
    const container = document.getElementById('ke-cam-overlays');
    if (!container) return;
    const confirmBar = document.getElementById('ke-cam-confirm');
    if ((confirmBar && !confirmBar.classList.contains('hidden')) || pendingScanCode) {
      if (container.innerHTML) container.innerHTML = '';
      return;
    }
    const now = Date.now();
    if (window._zxingDetectedCodes) {
      for (const [code, ts] of window._zxingDetectedCodes) {
        if (now - ts > 3000) window._zxingDetectedCodes.delete(code);
      }
    }
    if (!window._zxingDetectedCodes || window._zxingDetectedCodes.size === 0) {
      if (container.innerHTML) container.innerHTML = '';
      return;
    }
    let html = '';
    let idx = 0;
    for (const code of window._zxingDetectedCodes.keys()) {
      html += `<div class="ke-cam-overlay-box" data-code="${code}" style="left:5%;top:${20 + idx * 14}%;width:90%;height:auto;min-height:32px"><span class="ke-cam-overlay-label">${code}</span></div>`;
      idx++;
    }
    if (container.innerHTML !== html) {
      container.innerHTML = html;
      container.querySelectorAll('.ke-cam-overlay-box').forEach(el => {
        el.addEventListener('click', () => selectBarcodeCode(el.dataset.code));
      });
    }
  }

  function selectBarcodeCode(code) {
    if (!code || !code.trim()) return;
    const pt = currentReport.sections[currentSectionIndex]?.photoTypes.find(t => t.id === selectedPhotoType);
    if (!pt?.isSN && !isKECode(code)) return;
    const confirmBar = document.getElementById('ke-cam-confirm');
    const confirmText = document.getElementById('ke-cam-confirm-text');
    const frame = document.getElementById('ke-cam-frame');
    const overlays = document.getElementById('ke-cam-overlays');
    document.querySelectorAll('.ke-cam-overlay-box').forEach(el => {
      el.classList.toggle('selected', el.dataset.code === code);
    });
    const label = pt?.isSN ? 'СН' : 'КЕ';
    confirmText.textContent = `${label}: ${code} — подтвердите`;
    confirmBar.classList.remove('hidden');
    if (frame) frame.classList.add('detected');
    confirmBar.dataset.code = code;
    scanCooldown = true;
    setTimeout(() => { scanCooldown = false; }, 2000);
  }

  function updateTrackingUI(found) {
    const frame = document.getElementById('ke-cam-frame');
    const status = document.getElementById('ke-cam-status');
    const pt = currentReport.sections[currentSectionIndex]?.photoTypes.find(t => t.id === selectedPhotoType);
    const label = pt?.isSN ? 'СН' : 'КЕ';
    if (!pendingScanCode) return;
    if (found) {
      if (frame) { frame.classList.add('detected'); frame.style.borderColor = ''; }
      if (status) {
        status.textContent = `✓ ${label}: ${pendingScanCode} — нажмите Сделать фото`;
        status.className = 'ke-cam-status found';
      }
    } else {
      if (frame) { frame.classList.remove('detected'); frame.style.borderColor = '#DC0000'; }
      if (status) {
        status.textContent = `⚠ ${label}: ${pendingScanCode} — наведите на выбранный ШК`;
        status.className = 'ke-cam-status lost';
      }
    }
  }

  function toggleTorch() {
    const btn = document.getElementById('ke-cam-torch');
    const track = videoStream?.getVideoTracks()[0];
    if (!track) return;
    torchOn = !torchOn;
    track.applyConstraints({ advanced: [{ torch: torchOn }] }).catch(() => {
      torchOn = !torchOn;
      showToast('Фонарик не поддерживается');
    });
    btn.classList.toggle('on', torchOn);
  }

  function closeKEModal() {
    torchOn = false;
    const modal = document.getElementById('ke-camera-modal');
    const video = document.getElementById('ke-cam-video');
    const overlays = document.getElementById('ke-cam-overlays');
    const confirmBar = document.getElementById('ke-cam-confirm');
    const status = document.getElementById('ke-cam-status');
    const frame = document.getElementById('ke-cam-frame');
    document.getElementById('ke-cam-torch').classList.remove('on');
    pendingScanCode = null;
    if (overlays) overlays.innerHTML = '';
    if (confirmBar) confirmBar.classList.add('hidden');
    if (status) status.className = 'ke-cam-status';
    if (frame) frame.classList.remove('detected');
    modal.classList.add('hidden');

    if (scanTimer) { clearInterval(scanTimer); scanTimer = null; }
    if (videoStream) { videoStream.getTracks().forEach(t => t.stop()); videoStream = null; }
    if (video && video.srcObject) { video.srcObject = null; }
    if (window._zxingBrowserReader) { window._zxingBrowserReader.reset(); window._zxingBrowserReader = null; }
    if (window._zxingOverlayTimer) { clearInterval(window._zxingOverlayTimer); window._zxingOverlayTimer = null; }
    window._zxingDetectedCodes = null;
  }

  function keCamCapture() {
    const video = document.getElementById('ke-cam-video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    
    const section = currentReport.sections[currentSectionIndex];
    section.photos.push({
      id: generateId(),
      typeId: selectedPhotoType,
      dataUrl: dataUrl,
      timestamp: new Date().toISOString()
    });
    
    if (pendingScanCode) {
      const pt = currentReport.sections[currentSectionIndex]?.photoTypes.find(t => t.id === selectedPhotoType);
      addKECode(pendingScanCode, pt?.isSN);
      pendingScanCode = null;
    } else {
      tryDecodeFromCapture(canvas);
    }
    
    const frame = document.getElementById('ke-cam-frame');
    if (frame) {
      frame.classList.add('detected');
      setTimeout(() => frame.classList.remove('detected'), 1000);
    }
    
    showToast('Фото сохранено');
    saveReport();
    renderSectionPhotos(section);
    renderPhotoTypes(section);
    closeKEModal();
  }

  function tryDecodeFromCapture(canvas) {
    const pt = currentReport.sections[currentSectionIndex]?.photoTypes.find(t => t.id === selectedPhotoType);
    const isSN = pt?.isSN;
    if (typeof ZXing !== 'undefined') {
      try {
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const lum = new ZXing.RGBLuminanceSource(imgData.data, w, h);
        const bmp = new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(lum));
        const hints = new Map();
        hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
          ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8,
          ZXing.BarcodeFormat.CODE_128, ZXing.BarcodeFormat.CODE_39,
          ZXing.BarcodeFormat.QR_CODE, ZXing.BarcodeFormat.UPC_A,
          ZXing.BarcodeFormat.DATA_MATRIX, ZXing.BarcodeFormat.ITF
        ]);
        const reader = new ZXing.MultiFormatReader();
        reader.setHints(hints);
        const result = reader.decode(bmp);
        if (result && result.getText()) {
          const code = result.getText();
          if (isSN || isKECode(code)) {
            addKECode(code, isSN);
            showToast('ШК распознан: ' + code);
            return;
          }
        }
      } catch(e) {}
    }
    const label = isSN ? 'СН' : 'КЕ';
    const entered = prompt('Номер ' + label + ' не распознан. Введите вручную:');
    if (entered && entered.trim()) {
      const code = entered.trim();
      if (isSN || isKECode(code)) {
        addKECode(code, isSN);
      } else {
        showToast('Некорректный номер ' + label);
      }
    }
  }

  function addKECode(code, isSN) {
    if (!currentReport) return;
    const arr = isSN ? 'snCodes' : 'keCodes';
    if (!currentReport[arr]) currentReport[arr] = [];
    if (currentReport[arr].includes(code)) return;
    currentReport[arr].push(code);
    saveReport();
    renderKEList();
  }

  function renderKEList() {
    const keContainer = document.getElementById('ke-items');
    const snContainer = document.getElementById('sn-items');
    if (!currentReport) return;

    if (currentReport.keCodes && currentReport.keCodes.length) {
      keContainer.innerHTML = '<div class="ke-sn-header"><span>КЕ (инвентарные номера)</span></div>' +
        currentReport.keCodes.map((code, i) => `
          <div class="ke-item" data-idx="${i}">
            <div class="ke-item-code">${escapeHtml(code)}</div>
            <button class="ke-item-delete"></button>
          </div>
        `).join('');
      keContainer.querySelectorAll('.ke-item-delete').forEach(btn => {
        btn.onclick = (e) => {
          const idx = parseInt(e.target.closest('.ke-item').dataset.idx);
          currentReport.keCodes.splice(idx, 1);
          saveReport();
          renderKEList();
        };
      });
    } else {
      keContainer.innerHTML = '';
    }

    if (currentReport.snCodes && currentReport.snCodes.length) {
      snContainer.innerHTML = '<div class="ke-sn-header"><span>Серийные номера</span></div>' +
        currentReport.snCodes.map((code, i) => `
          <div class="sn-item" data-idx="${i}">
            <div class="sn-item-code">${escapeHtml(code)}</div>
            <button class="sn-item-delete"></button>
          </div>
        `).join('');
      snContainer.querySelectorAll('.sn-item-delete').forEach(btn => {
        btn.onclick = (e) => {
          const idx = parseInt(e.target.closest('.sn-item').dataset.idx);
          currentReport.snCodes.splice(idx, 1);
          saveReport();
          renderKEList();
        };
      });
    } else {
      snContainer.innerHTML = '';
    }
  }

  function finishReport() {
    currentReport.status = 'completed';
    currentReport.completedAt = new Date().toISOString();
    saveReport();
    showComplete();
  }

  function showComplete() {
    showPage('complete');
    let totalPhotos = 0;
    let doneTypes = 0;
    let totalTypes = 0;
    currentReport.sections.forEach(sec => {
      totalPhotos += sec.photos.length;
      sec.photoTypes.forEach(pt => {
        if (pt.isKE || pt.isSN) return;
        totalTypes++;
        if (sec.photos.some(p => p.typeId === pt.id)) doneTypes++;
      });
    });

    document.getElementById('complete-stats').innerHTML = `
      <div class="stat"><div class="stat-value">${currentReport.sections.length}</div><div class="stat-label">Секций</div></div>
      <div class="stat"><div class="stat-value">${totalPhotos}</div><div class="stat-label">Фото</div></div>
      <div class="stat"><div class="stat-value">${Math.round((doneTypes/totalTypes)*100)}%</div><div class="stat-label">Готово</div></div>
    `;

    preBuildArchive();
  }

  function getXlsxFilename() {
    const fmt = currentReport.objectType.toUpperCase();
    const obj = currentReport.reportName || '';
    const tech = currentReport.technician || '';
    return `${fmt} ${obj} ЧЛ ТО ${fmt} (${tech}).xlsx`;
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
      'kso': 'КСО',
      'td': 'ТД',
      'tsd': 'ТСД',
      'uks': 'Универсальный кассовый стол (УКС)',
      'server': 'Серверная',
      'vesi_napolnie': 'Весы напольные',
      'vesi_samoobsl': 'Весы самообслуживания',
      'vesi_pechat': 'Весы с печатью',
      'mp': 'Мобильный принтер',
      'stp': 'Стационарный термопринтер',
      'rmd': 'РМД'
    };

    for (const [eqId, eqName] of Object.entries(eqMap)) {
      if (currentReport.equipmentCounts && currentReport.equipmentCounts[eqId]) {
        ws_data.push([eqName, String(currentReport.equipmentCounts[eqId])]);
      }
    }

    let keDone = 0, keTotal = 0, snDone = 0, snTotal = 0;
    for (const sec of (currentReport.sections || [])) {
      for (const pt of sec.photoTypes) {
        if (pt.isKE) {
          keTotal++;
          if (sec.photos.some(p => p.typeId === pt.id)) keDone++;
        } else if (pt.isSN) {
          snTotal++;
          if (sec.photos.some(p => p.typeId === pt.id)) snDone++;
        }
      }
    }
    ws_data.push([null]);
    ws_data.push(['КЕ (инвентарные номера)', `${keDone} из ${keTotal}`]);
    ws_data.push(['Серийные номера', `${snDone} из ${snTotal}`]);
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
        filename = filename.replace('.jpg', ` ${photo.photoNumber}.jpg`);

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

  function preBuildArchive() {
    const btn = document.getElementById('btn-send-report');
    btn.disabled = true;
    btn.innerHTML = 'Создание архива...';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      btn.disabled = false;
      btn.textContent = 'Отправить отчёт';
      showToast('Не удалось создать архив');
    }, 30000);
    buildZipBlob().then(blob => {
      clearTimeout(timer);
      if (reportDiscarded || timedOut) return;
      cachedZipBlob = blob;
      btn.disabled = false;
      btn.innerHTML = `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Отправить отчёт`;
    }).catch(() => {
      clearTimeout(timer);
      if (reportDiscarded) return;
      btn.disabled = false;
      btn.textContent = 'Отправить отчёт';
    });
  }

  function sendReport() {
    if (!cachedZipBlob) {
      showToast('Архив ещё создаётся, повторите');
      return;
    }
    const reportName = currentReport.reportName || 'Отчёт';
    const filename = `${(currentReport.objectType || '').toUpperCase()}_${reportName}_${(currentReport.date || '').replace(/-/g, '.')}.zip`;
    const file = new File([cachedZipBlob], filename, { type: 'application/zip' });
    navigator.share({ title: `Фотоотчёт: ${reportName}`, text: `Фотоотчёт: ${reportName}`, files: [file] }).catch(err => {
      if (err && err.name === 'AbortError') return;
      downloadBlob(cachedZipBlob, filename);
      showToast('Архив сохранён в Загрузки');
    });
  }

  function deleteCurrentReport() {
    reportDiscarded = true;
    if (currentReport && currentReport.id) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(currentReport.id);
    }
    cachedZipBlob = null;
    currentReport = null;
    showPage('home');
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

  function generateReportJSON() {
    const photos = [];
    currentReport.sections.forEach(sec => {
      sec.photos.forEach(photo => {
        const pt = sec.photoTypes.find(t => t.id === photo.typeId);
        if (pt) {
          let filename = pt.filename;
          filename = filename.replace('.jpg', ` ${photo.photoNumber}.jpg`);
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

    let photoCount = 0;
    for (const sec of currentReport.sections) {
      for (const photo of sec.photos) {
        const pt = sec.photoTypes.find(t => t.id === photo.typeId);
        if (!pt) continue;
        photoCount++;
        if (!photo.dataUrl) continue;
        const base64 = photo.dataUrl.split(',')[1] || '';
        let filename = pt.filename;
        filename = filename.replace('.jpg', ` ${photo.photoNumber}.jpg`);
        if (pt.isKE) {
          zip.file(`КЕ/${filename}`, base64, { base64: true });
        } else if (pt.isSN) {
          zip.file(`Серийные номера/${filename}`, base64, { base64: true });
        } else {
          zip.file(filename, base64, { base64: true });
        }
      }
    }

    let keDone = 0, keTotal = 0, snDone = 0, snTotal = 0;
    for (const sec of currentReport.sections) {
      for (const pt of sec.photoTypes) {
        if (pt.isKE) {
          keTotal++;
          if (sec.photos.some(p => p.typeId === pt.id)) keDone++;
        } else if (pt.isSN) {
          snTotal++;
          if (sec.photos.some(p => p.typeId === pt.id)) snDone++;
        }
      }
    }

    const lines = [
      `Фото Отчёт — ${currentReport.reportName}`,
      `Дата: ${currentReport.date}`,
      `Техник: ${currentReport.technician}`,
      '',
      `Всего фото: ${photoCount}`,
      `КЕ: ${keDone} из ${keTotal}`,
      `Серийные номера: ${snDone} из ${snTotal}`,
      '',
      'КЕ (инвентарные номера):'
    ];
    if (currentReport.keCodes && currentReport.keCodes.length > 0) {
      currentReport.keCodes.forEach(code => lines.push(`  ${code}`));
    }
    lines.push('', 'Серийные номера:');
    if (currentReport.snCodes && currentReport.snCodes.length > 0) {
      currentReport.snCodes.forEach(code => lines.push(`  ${code}`));
    }
    zip.file('Коды.txt', lines.join('\n'));

    return await zip.generateAsync({ type: 'blob', compression: 'STORE' });
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function safeAddEvent(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  }

  safeAddEvent('input-object-name', 'input', updateConfigButton);

  init();
})();
