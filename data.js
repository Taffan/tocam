const TYPE_CONFIGS = {
  mk: {
    name: 'МК',
    label: 'Магнит Косметик',
    separator: '',
    equipment: [
      { id: 'kassa', name: 'Касса', icon: 'kassa' },
      { id: 'td', name: 'ТД', icon: 'td' },
      { id: 'tsd', name: 'ТСД', icon: 'tsd' },
      { id: 'uks', name: 'УКС', icon: 'uks' },
      { id: 'mp', name: 'МП', icon: 'mp' }
    ],
    hasProchee: true
  },
  mm: {
    name: 'ММ',
    label: 'Магнит Супермаркет',
    separator: ' # ',
    equipment: [
      { id: 'kassa_zona', name: 'Кассовая зона', icon: 'kassa' },
      { id: 'kso', name: 'КСО', icon: 'kso' },
      { id: 'td', name: 'ТД', icon: 'td' },
      { id: 'tsd', name: 'ТСД', icon: 'tsd' },
      { id: 'uks', name: 'УКС', icon: 'uks' },
      { id: 'vesi', name: 'Весы', icon: 'vesi' },
      { id: 'mp', name: 'Мобильный принтер', icon: 'mp' }
    ],
    hasProchee: true
  },
  ma: {
    name: 'МА',
    label: 'Магнит Аптека',
    separator: ' # ',
    equipment: [
      { id: 'kassa_zona', name: 'Кассовая зона', icon: 'kassa' },
      { id: 'td', name: 'ТД', icon: 'td' },
      { id: 'tsd', name: 'ТСД', icon: 'tsd' },
      { id: 'uks', name: 'УКС', icon: 'uks' }
    ],
    hasProchee: true
  }
};

const PHOTO_TYPES = {
  kassa: {
    photo: [
      { id: 'obshiy_vid', name: 'Общий Вид', filename: 'Общий Вид', multi: true },
      { id: 'obshiy_vid_pokupatel', name: 'Общий Вид (покупатель)', filename: 'Общий Вид (покупатель)', multi: true },
      { id: 'obshiy_vid_oborud', name: 'Общий Вид Оборудование', filename: 'Общий Вид Оборудование', multi: true },
      { id: 'kkt', name: 'ККТ', filename: 'ККТ', multi: true },
      { id: 'chek', name: 'Фото Чека', filename: 'Фото Чека', multi: true },
      { id: 'markirovka_bp', name: 'Маркировка БП', filename: 'Маркировка БП', multi: true },
      { id: 'markirovka_oborud', name: 'Маркировка оборудования', filename: 'Маркировка оборудования', multi: true }
    ],
    ke: [
      { id: 'ke_kkt', name: 'КЕ ККТ', filename: 'КЕ ККТ' },
      { id: 'ke_ibp', name: 'КЕ ИБП', filename: 'КЕ ИБП' },
      { id: 'ke_pk', name: 'КЕ ПК', filename: 'КЕ ПК' },
      { id: 'ke_pin_pad', name: 'КЕ Пин Пад', filename: 'КЕ Пин Пад' },
      { id: 'ke_skaner', name: 'КЕ Сканер ШК', filename: 'КЕ Сканер ШК' },
      { id: 'ke_skaner_ruchnoy', name: 'КЕ Ручной Сканер ШК', filename: 'КЕ Ручной Сканер ШК' }
    ],
    sn: [
      { id: 'sn_kkt', name: 'СН ККТ', filename: 'СН ККТ' },
      { id: 'sn_ibp', name: 'СН ИБП', filename: 'СН ИБП' },
      { id: 'sn_pk', name: 'СН ПК', filename: 'СН ПК' },
      { id: 'sn_pin_pad', name: 'СН Пин Пад', filename: 'СН Пин Пад' },
      { id: 'sn_skaner', name: 'СН Сканер ШК', filename: 'СН Сканер ШК' },
      { id: 'sn_skaner_ruchnoy', name: 'СН Ручной Сканер ШК', filename: 'СН Ручной Сканер ШК' }
    ]
  },
  td: {
    photo: [
      { id: 'montazh', name: 'Фото ТД (Общий вид)', filename: 'Фото ТД (Общий вид)', multi: true },
      { id: 'fokus', name: 'Фото ТД (Фокус)', filename: 'Фото ТД (Фокус)', multi: true }
    ],
    ke: [
      { id: 'ke', name: 'Фото ТД КЕ', filename: 'Фото ТД КЕ' }
    ],
    sn: [
      { id: 'sn', name: 'СН ТД', filename: 'СН ТД' }
    ]
  },
  tsd: {
    photo: [
      { id: 'vid', name: 'Фото ТСД (Общий вид)', filename: 'Фото ТСД (Общий вид)', multi: true }
    ],
    ke: [
      { id: 'ke', name: 'Фото ТСД КЕ', filename: 'Фото ТСД КЕ' }
    ],
    sn: [
      { id: 'sn', name: 'СН ТСД', filename: 'СН ТСД' }
    ]
  },
  uks: {
    photo: [
      { id: 'obshiy_vid_am', name: 'Фото общего вида УКС (со стороны АММ)', filename: 'Фото общего вида УКС (со стороны АММ)', multi: true },
      { id: 'obshiy_vid_szadi', name: 'Фото общего вида УКС (вид сзади)', filename: 'Фото общего вида УКС (вид сзади)', multi: true },
      { id: 'obshiy_vid_sred', name: 'Фото общего вида УКС (вид сзади средняя часть)', filename: 'Фото общего вида УКС (вид сзади средняя часть)', multi: true },
      { id: 'obshiy_vid_niz', name: 'Фото общего вида УКС (вид сзади нижняя часть)', filename: 'Фото общего вида УКС (вид сзади нижняя часть)', multi: true },
      { id: 'indikacia', name: 'Фото индикации на шлюзе', filename: 'Фото индикации на шлюзе', multi: true },
      { id: 'pkd', name: 'Фото обслуженного ПКД (персональный компьютер директора)', filename: 'Фото обслуженного ПКД (персональный компьютер директора)', multi: true },
      { id: 'server_pk', name: 'Фото обслуженного Серверного ПК', filename: 'Фото обслуженного Серверного ПК', multi: true },
      { id: 'setevoe_oborud', name: 'Фото сетевого оборудования', filename: 'Фото сетевого оборудования', multi: true },
      { id: 'setevoe_td', name: 'Фото сетевого оборудования для ТД', filename: 'Фото сетевого оборудования для ТД', multi: true },
      { id: 'setevoe_inet', name: 'Фото сетевого оборудования доступа в интернет', filename: 'Фото сетевого оборудования доступа в интернет', multi: true },
      { id: 'perekluchatel', name: 'Фото переключателя', filename: 'Фото переключателя', multi: true },
      { id: 'markirovka_bp', name: 'Фото маркировки БП в блоках розеток', filename: 'Фото маркировки БП в блоках розеток', multi: true },
      { id: 'klyuch_egas', name: 'Фото ключа ЕГАИС', filename: 'Фото ключа ЕГАИС', multi: true }
    ],
    ke: [
      { id: 'ke_server_pk', name: 'Фото КЕ Серверного ПК', filename: 'Фото КЕ Серверного ПК' },
      { id: 'ke_ibp_server', name: 'Фото КЕ ИБП Сервер', filename: 'Фото КЕ ИБП Сервер' },
      { id: 'ke_pkd', name: 'Фото КЕ ПКД', filename: 'Фото КЕ ПКД' },
      { id: 'ke_ibp_pkd', name: 'Фото КЕ ИБП ПКД', filename: 'Фото КЕ ИБП ПКД' },
      { id: 'ke_monitor', name: 'Фото КЕ Монитор', filename: 'Фото КЕ Монитор' },
      { id: 'ke_golosovoy', name: 'Фото КЕ Голосовой шлюз', filename: 'Фото КЕ Голосовой шлюз' },
      { id: 'ke_router_master', name: 'Фото КЕ Роутер Мастер', filename: 'Фото КЕ Роутер Мастер' },
      { id: 'ke_router_rezerv', name: 'Фото КЕ Роутер Резерв', filename: 'Фото КЕ Роутер Резерв' },
      { id: 'ke_printer', name: 'Фото КЕ Принтер', filename: 'Фото КЕ Принтер' },
      { id: 'ke_skaner_a4', name: 'Фото КЕ Сканер А4', filename: 'Фото КЕ Сканер А4' }
    ],
    sn: [
      { id: 'sn_server_pk', name: 'СН Серверного ПК', filename: 'СН Серверного ПК' },
      { id: 'sn_ibp_server', name: 'СН ИБП Сервер', filename: 'СН ИБП Сервер' },
      { id: 'sn_pkd', name: 'СН ПКД', filename: 'СН ПКД' },
      { id: 'sn_ibp_pkd', name: 'СН ИБП ПКД', filename: 'СН ИБП ПКД' },
      { id: 'sn_monitor', name: 'СН Монитор', filename: 'СН Монитор' },
      { id: 'sn_golosovoy', name: 'СН Голосовой шлюз', filename: 'СН Голосовой шлюз' },
      { id: 'sn_router_master', name: 'СН Роутер Мастер', filename: 'СН Роутер Мастер' },
      { id: 'sn_router_rezerv', name: 'СН Роутер Резерв', filename: 'СН Роутер Резерв' },
      { id: 'sn_printer', name: 'СН Принтер', filename: 'СН Принтер' },
      { id: 'sn_skaner_a4', name: 'СН Сканер А4', filename: 'СН Сканер А4' }
    ]
  },
  mp: {
    photo: [
      { id: 'vid_pechat', name: 'Фото Мобильный принтер + печать(Общий вид)', filename: 'Фото Мобильный принтер + печать(Общий вид)', multi: true }
    ],
    ke: [
      { id: 'ke', name: 'Фото Мобильный принтер КЕ', filename: 'Фото Мобильный принтер КЕ' }
    ],
    sn: [
      { id: 'sn', name: 'СН Мобильный принтер', filename: 'СН Мобильный принтер' }
    ]
  },
  kassa_zona: {
    photo: [
      { id: 'obshiy_vid', name: 'Фото общего вида Касса (общий)', filename: 'Фото общего вида Касса (общий)', multi: true },
      { id: 'montazh_provoda', name: 'Фото общего вида Касса + монтаж СКС_проводов (снизу)', filename: 'Фото общего вида Касса + монтаж СКС_проводов (снизу)', multi: true },
      { id: 'kkt_chek', name: 'Фото ККТ + чек ККМ', filename: 'Фото ККТ + чек ККМ', multi: true },
      { id: 'markirovka_bp', name: 'Фото маркировки БП', filename: 'Фото маркировки БП', multi: true },
      { id: 'markirovka_ibp_pk', name: 'Фото маркировки ИБП и ПК', filename: 'Фото маркировки ИБП и ПК', multi: true },
      { id: 'kassoviy_pk', name: 'Фото обслуженного Кассового ПК', filename: 'Фото обслуженного Кассового ПК', multi: true },
      { id: 'klyuchi', name: 'Фото ключей', filename: 'Фото ключей', multi: true }
    ],
    ke: [
      { id: 'ke_kkt', name: 'Фото КЕ ККТ', filename: 'Фото КЕ ККТ' },
      { id: 'ke_ibp', name: 'Фото КЕ ИБП', filename: 'Фото КЕ ИБП' },
      { id: 'ke_pk', name: 'Фото КЕ ПК', filename: 'Фото КЕ ПК' },
      { id: 'ke_pin_pad', name: 'Фото КЕ Пин Пад', filename: 'Фото КЕ Пин Пад' },
      { id: 'ke_skaner', name: 'Фото КЕ Сканер ШК', filename: 'Фото КЕ Сканер ШК' },
      { id: 'ke_skaner_ruchnoy', name: 'Фото КЕ Ручной Сканер ШК', filename: 'Фото КЕ Ручной Сканер ШК' },
      { id: 'ke_vesi', name: 'Фото КЕ Весы прикассовые', filename: 'Фото КЕ Весы прикассовые' },
      { id: 'ke_monitor', name: 'Фото КЕ Монитор', filename: 'Фото КЕ Монитор' }
    ],
    sn: [
      { id: 'sn_kkt', name: 'СН ККТ', filename: 'СН ККТ' },
      { id: 'sn_ibp', name: 'СН ИБП', filename: 'СН ИБП' },
      { id: 'sn_pk', name: 'СН ПК', filename: 'СН ПК' },
      { id: 'sn_pin_pad', name: 'СН Пин Пад', filename: 'СН Пин Пад' },
      { id: 'sn_skaner', name: 'СН Сканер ШК', filename: 'СН Сканер ШК' },
      { id: 'sn_skaner_ruchnoy', name: 'СН Ручной Сканер ШК', filename: 'СН Ручной Сканер ШК' },
      { id: 'sn_vesi', name: 'СН Весы прикассовые', filename: 'СН Весы прикассовые' },
      { id: 'sn_monitor', name: 'СН Монитор', filename: 'СН Монитор' }
    ]
  },
  kso: {
    photo: [
      { id: 'obshiy_vid_kso', name: 'Фото общего вида КСО (общий)', filename: 'Фото общего вида КСО (общий)', multi: true },
      { id: 'tumba', name: 'Фото тумбы КСО (общий вид, монтаж СКС_кабелей)', filename: 'Фото тумбы КСО (общий вид, монтаж СКС_кабелей)', multi: true, maxPhotos: 4 },
      { id: 'kkt_chek', name: 'Фото ККТ + чек ККМ', filename: 'Фото ККТ + чек ККМ', multi: true },
      { id: 'markirovka_bp', name: 'Фото маркировки БП', filename: 'Фото маркировки БП', multi: true },
      { id: 'montazh_tbo', name: 'Фото монтажа ТБО', filename: 'Фото монтажа ТБО', multi: true },
      { id: 'vesovaya_panel', name: 'Фото обслуженной весовой панели', filename: 'Фото обслуженной весовой панели', multi: true }
    ],
    ke: [
      { id: 'ke_kkt', name: 'Фото КЕ ККТ', filename: 'Фото КЕ ККТ' },
      { id: 'ke_ibp', name: 'Фото КЕ ИБП', filename: 'Фото КЕ ИБП' },
      { id: 'ke_kso', name: 'Фото КЕ КСО', filename: 'Фото КЕ КСО' },
      { id: 'ke_tbo', name: 'Фото КЕ ТБО', filename: 'Фото КЕ ТБО' },
      { id: 'ke_vesi', name: 'Фото КЕ весы', filename: 'Фото КЕ весы' }
    ],
    sn: [
      { id: 'sn_kkt', name: 'СН ККТ', filename: 'СН ККТ' },
      { id: 'sn_ibp', name: 'СН ИБП', filename: 'СН ИБП' },
      { id: 'sn_kso', name: 'СН КСО', filename: 'СН КСО' },
      { id: 'sn_tbo', name: 'СН ТБО', filename: 'СН ТБО' },
      { id: 'sn_vesi', name: 'СН весы', filename: 'СН весы' }
    ]
  },
  vesi: {
    photo: [
      { id: 'vesi_napolnie', name: 'Фото Весы напольные', filename: 'Фото Весы напольные', multi: true }
    ],
    ke: [
      { id: 'ke', name: 'Фото КЕ Весы напольные', filename: 'Фото КЕ Весы напольные' }
    ],
    sn: [
      { id: 'sn', name: 'СН Весы напольные', filename: 'СН Весы напольные' }
    ]
  },
  prochee: {
    photo: [
      { id: 'planograma', name: 'Планограмма', filename: 'Планограмма', multi: true, maxPhotos: 10 },
      { id: 'sluzhba_nut', name: 'Служба NUT', filename: 'Служба NUT', multi: true, maxPhotos: 10 },
      { id: 'raznie_sushnosti', name: 'Прочее', filename: 'Прочее', multi: true, maxPhotos: 10 }
    ],
    ke: []
  }
};

function getPhotoTypes(typeId) {
  const types = PHOTO_TYPES[typeId];
  if (!types) return [];
  
  const all = [];
  (types.photo || []).forEach(pt => all.push({ ...pt, isKE: false, isSN: false }));
  (types.ke || []).forEach(kt => all.push({ ...kt, isKE: true, isSN: false }));
  (types.sn || []).forEach(sn => all.push({ ...sn, isKE: false, isSN: true }));
  
  return all;
}

function generateSections(type, equipmentCounts) {
  const sections = [];
  const config = TYPE_CONFIGS[type];
  if (!config) return sections;

  config.equipment.forEach(eq => {
    const count = equipmentCounts[eq.id] || 0;

    for (let n = 1; n <= count; n++) {
      let sectionName;
      let sectionPrefix;
      let numSuffix;

      if (eq.id === 'kassa') {
        sectionName = n === 1 ? eq.name : `${eq.name} ${n}`;
        sectionPrefix = eq.name;
        numSuffix = n;
      } else if (['td', 'tsd'].includes(eq.id)) {
        sectionName = `${eq.name} ${n}`;
        sectionPrefix = eq.name;
        numSuffix = n;
      } else if (['kassa_zona', 'kso', 'vesi', 'mp'].includes(eq.id)) {
        sectionName = `${eq.name} ${n}`;
        sectionPrefix = eq.name;
        numSuffix = n;
      } else {
        sectionName = eq.name;
        sectionPrefix = eq.name;
        numSuffix = '';
      }

      const photoTypes = getPhotoTypes(eq.id);
      const formattedTypes = photoTypes.map(pt => {
        let filename;

        if (type === 'mk') {
          if (eq.id === 'kassa') {
            filename = `${sectionPrefix} ${numSuffix} ${pt.filename}`;
          } else if (['td', 'tsd'].includes(eq.id)) {
            filename = `${sectionPrefix}${numSuffix} ${pt.filename}`;
          } else if (eq.id === 'uks' || eq.id === 'mp') {
            filename = `${sectionPrefix} ${pt.filename}`;
          } else {
            filename = `${sectionPrefix} ${pt.filename}`;
          }
        } else {
          if (numSuffix) {
            filename = `${sectionPrefix} ${numSuffix}${config.separator}${pt.filename}`;
          } else {
            filename = `${sectionPrefix}${config.separator}${pt.filename}`;
          }
        }

        return { ...pt, filename: filename + '.jpg' };
      });

      sections.push({
        id: `${eq.id}_${n}`,
        name: sectionName,
        prefix: sectionPrefix,
        num: numSuffix,
        type: eq.id,
        status: 'pending',
        photos: [],
        photoTypes: formattedTypes
      });
    }
  });

  if (config.hasProchee) {
    const photoTypes = getPhotoTypes('prochee');
    sections.push({
      id: 'prochee',
      name: 'Прочее',
      prefix: 'Прочее',
      num: '',
      type: 'prochee',
      status: 'pending',
      photos: [],
      photoTypes: photoTypes.map(pt => ({ ...pt, filename: `${pt.filename}.jpg` }))
    });
  }

  return sections;
}

const SECTION_ICONS = {
  kassa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="14" r="1"/></svg>`,
  kassa_zona: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="14" r="1"/></svg>`,
  kso: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><circle cx="12" cy="15" r="2"/></svg>`,
  td: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M6 12h12M6 16h8"/></svg>`,
  tsd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>`,
  uks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  vesi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>`,
  mp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9V6a6 6 0 1112 0v3"/><rect x="3" y="9" width="18" height="12" rx="1"/></svg>`,
  prochee: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`
};

const EQUIPMENT_ICONS = {
  kassa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="14" r="1"/></svg>`,
  kassa_zona: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="14" r="1"/></svg>`,
  kso: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><circle cx="12" cy="15" r="2"/></svg>`,
  td: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M6 12h12M6 16h8"/></svg>`,
  tsd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>`,
  uks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  vesi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>`,
  mp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9V6a6 6 0 1112 0v3"/><rect x="3" y="9" width="18" height="12" rx="1"/></svg>`
};
