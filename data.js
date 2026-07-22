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
      { id: 'mp', name: 'МП', icon: 'mp' },
      { id: 'stp', name: 'Стационарный термопринтер', icon: 'stp' }
    ],
    hasProchee: true
  },
  mm_uks: {
    name: 'ММ',
    label: 'Магнит Супермаркет (УКС)',
    separator: ' # ',
    equipment: [
      { id: 'kassa_zona', name: 'Кассовая зона', icon: 'kassa' },
      { id: 'kso', name: 'КСО', icon: 'kso' },
      { id: 'td', name: 'ТД', icon: 'td' },
      { id: 'tsd', name: 'ТСД', icon: 'tsd' },
      { id: 'uks', name: 'УКС', icon: 'uks' },
      { id: 'vesi_napolnie', name: 'Весы', icon: 'vesi' },
      { id: 'mp', name: 'Мобильный принтер', icon: 'mp' },
      { id: 'stp', name: 'Стационарный термопринтер', icon: 'stp' }
    ],
    hasProchee: true
  },
  mm_rmd: {
    name: 'ММ',
    label: 'Магнит Супермаркет (РМД)',
    separator: ' # ',
    equipment: [
      { id: 'kassa_zona', name: 'Кассовая зона', icon: 'kassa' },
      { id: 'kso', name: 'КСО', icon: 'kso' },
      { id: 'td', name: 'ТД', icon: 'td' },
      { id: 'tsd', name: 'ТСД', icon: 'tsd' },
      { id: 'rmd', name: 'РМД', icon: 'rmd' },
      { id: 'vesi_napolnie', name: 'Весы', icon: 'vesi' },
      { id: 'mp', name: 'Мобильный принтер', icon: 'mp' },
      { id: 'stp', name: 'Стационарный термопринтер', icon: 'stp' }
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
      { id: 'uks', name: 'УКС', icon: 'uks' },
      { id: 'stp', name: 'Стационарный термопринтер', icon: 'stp' }
    ],
    hasProchee: true
  },
  gm: {
    name: 'ГМ',
    label: 'Гипермаркет',
    separator: ' # ',
    equipment: [
      { id: 'kassa_zona', name: 'Кассовая зона', icon: 'kassa' },
      { id: 'kso', name: 'КСО', icon: 'kso' },
      { id: 'td', name: 'ТД', icon: 'td' },
      { id: 'tsd', name: 'ТСД', icon: 'tsd' },
      { id: 'uks', name: 'УКС', icon: 'uks' },
      { id: 'vesi_napolnie', name: 'Весы напольные', icon: 'vesi' },
      { id: 'vesi_samoobsl', name: 'Весы самообслуживания', icon: 'vesi' },
      { id: 'vesi_pechat', name: 'Весы с печатью', icon: 'vesi' },
      { id: 'mp', name: 'Мобильный принтер', icon: 'mp' },
      { id: 'stp', name: 'Стационарный термопринтер', icon: 'stp' }
    ],
    hasProchee: true
  }
};

const PHOTO_TYPES = {
  kassa: {
    photo: [
      { id: 'obshiy_vid', name: 'Общий Вид', filename: 'Общий Вид', multi: true, hint: 'Видно расположение оборудования (ККМ, сканер ШК, клавиатура, монитор, ТБО, дисплей, весы).' },
      { id: 'obshiy_vid_pokupatel', name: 'Общий Вид (покупатель)', filename: 'Общий Вид (покупатель)', multi: true, hint: 'Видно оборудование со стороны покупателя.' },
      { id: 'obshiy_vid_oborud', name: 'Общий Вид Оборудование', filename: 'Общий Вид Оборудование', multi: true, hint: 'Видно расположение оборудования на столе.' },
      { id: 'kkt', name: 'ККТ', filename: 'ККТ', multi: true, hint: 'ККТ имеет все элементы. Снятый Х-отчет: дата, качество печати, без срезов, сработавший отрезчик.' },
      { id: 'chek', name: 'Фото Чека', filename: 'Фото Чека', multi: true, hint: 'Чек с читаемым текстом, дата, качество печати.' },
      { id: 'markirovka_bp', name: 'Маркировка БП', filename: 'Маркировка БП', multi: true, hint: 'Видно маркировку на блоках питания.' },
      { id: 'markirovka_oborud', name: 'Маркировка оборудования', filename: 'Маркировка оборудования', multi: true, hint: 'Видно отчетливо маркировку оборудования.' }
    ],
    ke: [
      { id: 'ke_kkt', name: 'КЕ ККТ', filename: 'КЕ ККТ', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_ibp', name: 'КЕ ИБП', filename: 'КЕ ИБП', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_pk', name: 'КЕ ПК', filename: 'КЕ ПК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_pin_pad', name: 'КЕ Пин Пад', filename: 'КЕ Пин Пад', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_skaner', name: 'КЕ Сканер ШК', filename: 'КЕ Сканер ШК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_skaner_ruchnoy', name: 'КЕ Ручной Сканер ШК', filename: 'КЕ Ручной Сканер ШК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn_kkt', name: 'СН ККТ', filename: 'СН ККТ', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_ibp', name: 'СН ИБП', filename: 'СН ИБП', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_pk', name: 'СН ПК', filename: 'СН ПК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_pin_pad', name: 'СН Пин Пад', filename: 'СН Пин Пад', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_skaner', name: 'СН Сканер ШК', filename: 'СН Сканер ШК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_skaner_ruchnoy', name: 'СН Ручной Сканер ШК', filename: 'СН Ручной Сканер ШК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
  },
  td: {
    photo: [
      { id: 'montazh', name: 'Фото ТД (Общий вид)', filename: 'Фото ТД (Общий вид)', multi: true, hint: 'Видно на какой высоте и как смонтирована ТД.' },
      { id: 'fokus', name: 'Фото ТД (Фокус)', filename: 'Фото ТД (Фокус)', multi: true, hint: 'Видно маркировку на ТД.' }
    ],
    ke: [
      { id: 'ke', name: 'Фото ТД КЕ', filename: 'Фото ТД КЕ', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn', name: 'СН ТД', filename: 'СН ТД', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
  },
  tsd: {
    photo: [
      { id: 'vid', name: 'Фото ТСД (Общий вид)', filename: 'Фото ТСД (Общий вид)', multi: true, hint: 'Терминал сбора данных в исправном состоянии, заряжается.' }
    ],
    ke: [
      { id: 'ke', name: 'Фото ТСД КЕ', filename: 'Фото ТСД КЕ', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn', name: 'СН ТСД', filename: 'СН ТСД', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
  },
  uks: {
    photo: [
      { id: 'obshiy_vid_am', name: 'Фото общего вида УКС (со стороны АММ)', filename: 'Фото общего вида УКС (со стороны АММ)', multi: true, hint: 'Видно все оборудование на УКС без срезов. ПК и ИБП на полке/подставке, не на полу.' },
      { id: 'obshiy_vid_szadi', name: 'Фото общего вида УКС (вид сзади)', filename: 'Фото общего вида УКС (вид сзади)', multi: true, hint: 'Видно все оборудование. Демонтированы крышки/панели/короба.' },
      { id: 'obshiy_vid_sred', name: 'Фото общего вида УКС (вид сзади средняя часть)', filename: 'Фото общего вида УКС (вид сзади средняя часть)', multi: true, hint: 'Видно сетевое оборудование, маркировку проводов и блоков питания.' },
      { id: 'obshiy_vid_niz', name: 'Фото общего вида УКС (вид сзади нижняя часть)', filename: 'Фото общего вида УКС (вид сзади нижняя часть)', multi: true, hint: 'Видно расположение ИБП, системных блоков. Недопустимо на полу.' },
      { id: 'indikacia', name: 'Фото индикации на шлюзе', filename: 'Фото индикации на шлюзе', multi: true, hint: 'Видно, что на голосовом шлюзе отключен МР! Фото не вырвано из контекста.' },
      { id: 'pkd', name: 'Фото обслуженного ПКД (персональный компьютер директора)', filename: 'Фото обслуженного ПКД (персональный компьютер директора)', multi: true, hint: 'Видно отсутствие грязи и пыли внутри системного блока.' },
      { id: 'server_pk', name: 'Фото обслуженного Серверного ПК', filename: 'Фото обслуженного Серверного ПК', multi: true, hint: 'Видно отсутствие грязи и пыли внутри системного блока.' },
      { id: 'setevoe_oborud', name: 'Фото сетевого оборудования', filename: 'Фото сетевого оборудования', multi: true, hint: 'Видно маркировку проводов и хаба для оборудования (кроме ТД).' },
      { id: 'setevoe_td', name: 'Фото сетевого оборудования для ТД', filename: 'Фото сетевого оборудования для ТД', multi: true, hint: 'Видно маркировку проводов и хаба для ТД.' },
      { id: 'setevoe_inet', name: 'Фото сетевого оборудования доступа в интернет', filename: 'Фото сетевого оборудования доступа в интернет', multi: true, hint: 'Видно маркировку роутеров (основной и резерв) и проводов.' },
      { id: 'perekluchatel', name: 'Фото переключателя', filename: 'Фото переключателя', multi: true, hint: 'Видно маркировку на переключателе.' },
      { id: 'markirovka_bp', name: 'Фото маркировки БП в блоках розеток', filename: 'Фото маркировки БП в блоках розеток', multi: true, hint: 'Видно маркировку на всех блоках питания.' },
      { id: 'klyuch_egas', name: 'Фото ключа ЕГАИС', filename: 'Фото ключа ЕГАИС', multi: true, hint: 'Видно бирку с названием магазина, ключ пристегнут к корпусу ПКД.' }
    ],
    ke: [
      { id: 'ke_server_pk', name: 'Фото КЕ Серверного ПК', filename: 'Фото КЕ Серверного ПК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_ibp_server', name: 'Фото КЕ ИБП Сервер', filename: 'Фото КЕ ИБП Сервер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_pkd', name: 'Фото КЕ ПКД', filename: 'Фото КЕ ПКД', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_ibp_pkd', name: 'Фото КЕ ИБП ПКД', filename: 'Фото КЕ ИБП ПКД', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_monitor', name: 'Фото КЕ Монитор', filename: 'Фото КЕ Монитор', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_golosovoy', name: 'Фото КЕ Голосовой шлюз', filename: 'Фото КЕ Голосовой шлюз', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_router_master', name: 'Фото КЕ Роутер Мастер', filename: 'Фото КЕ Роутер Мастер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_router_rezerv', name: 'Фото КЕ Роутер Резерв', filename: 'Фото КЕ Роутер Резерв', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_printer', name: 'Фото КЕ Принтер', filename: 'Фото КЕ Принтер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_skaner_a4', name: 'Фото КЕ Сканер А4', filename: 'Фото КЕ Сканер А4', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn_server_pk', name: 'СН Серверного ПК', filename: 'СН Серверного ПК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_ibp_server', name: 'СН ИБП Сервер', filename: 'СН ИБП Сервер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_pkd', name: 'СН ПКД', filename: 'СН ПКД', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_ibp_pkd', name: 'СН ИБП ПКД', filename: 'СН ИБП ПКД', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_monitor', name: 'СН Монитор', filename: 'СН Монитор', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_golosovoy', name: 'СН Голосовой шлюз', filename: 'СН Голосовой шлюз', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_router_master', name: 'СН Роутер Мастер', filename: 'СН Роутер Мастер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_router_rezerv', name: 'СН Роутер Резерв', filename: 'СН Роутер Резерв', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_printer', name: 'СН Принтер', filename: 'СН Принтер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_skaner_a4', name: 'СН Сканер А4', filename: 'СН Сканер А4', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
  },
  mp: {
    photo: [
      { id: 'vid_pechat', name: 'Фото Мобильный принтер + печать(Общий вид)', filename: 'Фото Мобильный принтер + печать(Общий вид)', multi: true, hint: 'Оборудование исправно. Печать на этикетке без повреждений.' }
    ],
    ke: [
      { id: 'ke', name: 'Фото Мобильный принтер КЕ', filename: 'Фото Мобильный принтер КЕ', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn', name: 'СН Мобильный принтер', filename: 'СН Мобильный принтер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
  },
  stp: {
    photo: [
      { id: 'vid_pechat', name: 'Фото стационарный термопринтер + печать(Общий вид)', filename: 'Фото стационарный термопринтер + печать(Общий вид)', multi: true, hint: 'Оборудование исправно. Печать на этикетке без повреждений.' }
    ],
    ke: [
      { id: 'ke', name: 'Фото стационарный термопринтер КЕ', filename: 'Фото стационарный термопринтер КЕ', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn', name: 'СН Стационарный термопринтер', filename: 'СН Стационарный термопринтер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
  },
  kassa_zona: {
    photo: [
      { id: 'obshiy_vid', name: 'Фото общего вида Касса (общий)', filename: 'Фото общего вида Касса (общий)', multi: true, hint: 'Видно расположение оборудования (ККМ, сканер ШК, клавиатура, монитор, ТБО, дисплей покупателя, весы).' },
      { id: 'montazh_provoda', name: 'Фото общего вида Касса + монтаж СКС_проводов (снизу)', filename: 'Фото общего вида Касса + монтаж СКС_проводов (снизу)', multi: true, hint: 'Видно монтаж проводов СКС снизу.' },
      { id: 'kkt_chek', name: 'Фото ККТ + чек ККМ', filename: 'Фото ККТ + чек ККМ', multi: true, hint: 'ККТ имеет все элементы. Снятый Х-отчет: дата, качество печати, без срезов.' },
      { id: 'markirovka_bp', name: 'Фото маркировки БП', filename: 'Фото маркировки БП', multi: true, hint: 'Видно маркировку на всех блоках питания.' },
      { id: 'markirovka_ibp_pk', name: 'Фото маркировки ИБП и ПК', filename: 'Фото маркировки ИБП и ПК', multi: true, hint: 'Видно отчетливо маркировку ИБП и ПК.' },
      { id: 'kassoviy_pk', name: 'Фото обслуженного Кассового ПК', filename: 'Фото обслуженного Кассового ПК', multi: true, hint: 'Видно отсутствие грязи и пыли внутри. Неттоп не вскрывать.' },
      { id: 'klyuchi', name: 'Фото ключей', filename: 'Фото ключей', multi: true, hint: 'Видно бирку с названием магазина, ключ пристегнут.' }
    ],
    ke: [
      { id: 'ke_kkt', name: 'Фото КЕ ККТ', filename: 'Фото КЕ ККТ', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_ibp', name: 'Фото КЕ ИБП', filename: 'Фото КЕ ИБП', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_pk', name: 'Фото КЕ ПК', filename: 'Фото КЕ ПК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_pin_pad', name: 'Фото КЕ Пин Пад', filename: 'Фото КЕ Пин Пад', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_skaner', name: 'Фото КЕ Сканер ШК', filename: 'Фото КЕ Сканер ШК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_skaner_ruchnoy', name: 'Фото КЕ Ручной Сканер ШК', filename: 'Фото КЕ Ручной Сканер ШК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_vesi', name: 'Фото КЕ Весы прикассовые', filename: 'Фото КЕ Весы прикассовые', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_monitor', name: 'Фото КЕ Монитор', filename: 'Фото КЕ Монитор', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn_kkt', name: 'СН ККТ', filename: 'СН ККТ', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_ibp', name: 'СН ИБП', filename: 'СН ИБП', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_pk', name: 'СН ПК', filename: 'СН ПК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_pin_pad', name: 'СН Пин Пад', filename: 'СН Пин Пад', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_skaner', name: 'СН Сканер ШК', filename: 'СН Сканер ШК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_skaner_ruchnoy', name: 'СН Ручной Сканер ШК', filename: 'СН Ручной Сканер ШК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_vesi', name: 'СН Весы прикассовые', filename: 'СН Весы прикассовые', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_monitor', name: 'СН Монитор', filename: 'СН Монитор', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
  },
  kso: {
    photo: [
      { id: 'obshiy_vid_kso', name: 'Фото общего вида КСО (общий)', filename: 'Фото общего вида КСО (общий)', multi: true, hint: 'Видно расположение оборудования (ККМ, ТБО, панель весов) на столе/стойке.' },
      { id: 'tumba', name: 'Фото тумбы КСО (общий вид, монтаж СКС_кабелей)', filename: 'Фото тумбы КСО (общий вид, монтаж СКС_кабелей)', multi: true, maxPhotos: 4, hint: 'Видно монтаж кабелей СКС.' },
      { id: 'kkt_chek', name: 'Фото ККТ + чек ККМ', filename: 'Фото ККТ + чек ККМ', multi: true, hint: 'ККТ имеет все элементы. Снятый Х-отчет: дата, качество печати, без срезов.' },
      { id: 'markirovka_bp', name: 'Фото маркировки БП', filename: 'Фото маркировки БП', multi: true, hint: 'Видно маркировку на всех блоках питания.' },
      { id: 'montazh_tbo', name: 'Фото монтажа ТБО', filename: 'Фото монтажа ТБО', multi: true, hint: 'ТБО закреплен на кронштейне в штатные места. Не на стяжки.' },
      { id: 'vesovaya_panel', name: 'Фото обслуженной весовой панели', filename: 'Фото обслуженной весовой панели', multi: true, hint: 'Демонтировать панель, очистить полости. Чистая полость модуля весов.' }
    ],
    ke: [
      { id: 'ke_kkt', name: 'Фото КЕ ККТ', filename: 'Фото КЕ ККТ', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_ibp', name: 'Фото КЕ ИБП', filename: 'Фото КЕ ИБП', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_kso', name: 'Фото КЕ КСО', filename: 'Фото КЕ КСО', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_tbo', name: 'Фото КЕ ТБО', filename: 'Фото КЕ ТБО', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_vesi', name: 'Фото КЕ весы', filename: 'Фото КЕ весы', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn_kkt', name: 'СН ККТ', filename: 'СН ККТ', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_ibp', name: 'СН ИБП', filename: 'СН ИБП', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_kso', name: 'СН КСО', filename: 'СН КСО', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_tbo', name: 'СН ТБО', filename: 'СН ТБО', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_vesi', name: 'СН весы', filename: 'СН весы', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
  },
  vesi_napolnie: {
    photo: [
      { id: 'obshiy_vid', name: 'Фото Весы напольные', filename: 'Фото Весы напольные', multi: true, hint: 'Оборудование исправно, нет внешних индикаций о проблеме.' }
    ],
    ke: [
      { id: 'ke', name: 'Фото КЕ Весы напольные', filename: 'Фото КЕ Весы напольные', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn', name: 'СН Весы напольные', filename: 'СН Весы напольные', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
  },
  vesi_samoobsl: {
    photo: [
      { id: 'obshiy_vid', name: 'Фото Весы самообслуживания', filename: 'Фото Весы самообслуживания', multi: true, hint: 'Оборудование исправно, нет внешних индикаций о проблеме.' }
    ],
    ke: [
      { id: 'ke', name: 'Фото КЕ Весы самообслуживания', filename: 'Фото КЕ Весы самообслуживания', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn', name: 'СН Весы самообслуживания', filename: 'СН Весы самообслуживания', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
  },
  vesi_pechat: {
    photo: [
      { id: 'obshiy_vid', name: 'Фото Весы с печатью', filename: 'Фото Весы с печатью', multi: true, hint: 'Оборудование исправно, нет внешних индикаций о проблеме.' }
    ],
    ke: [
      { id: 'ke', name: 'Фото КЕ Весы с печатью', filename: 'Фото КЕ Весы с печатью', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn', name: 'СН Весы с печатью', filename: 'СН Весы с печатью', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
  },
  prochee: {
    photo: [
      { id: 'planograma', name: 'Планограмма', filename: 'Планограмма', multi: true, maxPhotos: 10, hint: 'Видно, в какой части ТЗ находится ТД (каждая отметка ТД подписана).' },
      { id: 'sluzhba_nut', name: 'Служба NUT', filename: 'Служба NUT', multi: true, maxPhotos: 10, hint: 'Служба МОТ видит ИБП сервера. Вывести информацию: "upsc ups".' },
      { id: 'raznie_sushnosti', name: 'Прочее', filename: 'Прочее', multi: true, maxPhotos: 10, hint: 'Фото оборудования и КЕ отсутствующего в основных блоках (прайсчекер, детектор банкнот, ХАБ УГАМ, медиа, контрольные весы и т.д.).' }
    ],
    ke: []
  },
  rmd: {
    photo: [
      { id: 'obshiy_vid_frontalno', name: 'Фото общего вида РМД (фронтально)', filename: 'Фото общего вида РМД (фронтально)', multi: true, hint: 'Видно все оборудование без срезов. ПК и ИБП на подставке, не на полу.' },
      { id: 'obshiy_vid_niz', name: 'Фото общего вида РМД (вид спереди нижняя часть)', filename: 'Фото общего вида РМД (вид спереди нижняя часть)', multi: true, hint: 'Видно расположение ИБП, системных блоков (ПКД, Сервера) и маркировку.' },
      { id: 'setevoe_oborud_rmd', name: 'Фото сетевого оборудования РМД', filename: 'Фото сетевого оборудования РМД', multi: true, hint: 'Видно маркировку проводов и хаба для оборудования (кроме ТД).' },
      { id: 'perekluchatel_rmd', name: 'Фото переключателя РМД', filename: 'Фото переключателя РМД', multi: true, hint: 'Видно маркировку на переключателе.' },
      { id: 'markirovka_bp_bloki_rozetok_rmd', name: 'Фото маркировки БП в блоках розеток РМД', filename: 'Фото маркировки БП в блоках розеток РМД', multi: true, hint: 'Видно маркировку на всех блоках питания.' },
      { id: 'raspolozhenie_pkd_server', name: 'Фото расположения ПКД и сервера', filename: 'Фото расположения ПКД и сервера', multi: true, hint: 'Системные блоки и ИБП на расстоянии не менее 5 см от пола.' },
      { id: 'obsluzhenniy_pkd', name: 'Фото обслуженного ПКД (персональный компьютер директора)', filename: 'Фото обслуженного ПКД (персональный компьютер директора)', multi: true, hint: 'Видно отсутствие грязи и пыли внутри системного блока.' },
      { id: 'obsluzhenniy_server', name: 'Фото обслуженного Серверного ПК', filename: 'Фото обслуженного Серверного ПК', multi: true, hint: 'Видно отсутствие грязи и пыли внутри системного блока.' },
      { id: 'klyuch_egais', name: 'Фото ключа ЕГАИС', filename: 'Фото ключа ЕГАИС', multi: true, hint: 'Видно бирку с названием магазина, ключ пристегнут к корпусу ПКД.' }
    ],
    ke: [
      { id: 'ke_server_pk', name: 'Фото КЕ Серверного ПК', filename: 'Фото КЕ Серверного ПК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_ibp_server', name: 'Фото КЕ ИБП Сервер', filename: 'Фото КЕ ИБП Сервер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_pkd', name: 'Фото КЕ ПКД', filename: 'Фото КЕ ПКД', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_ibp_pkd', name: 'Фото КЕ ИБП ПКД', filename: 'Фото КЕ ИБП ПКД', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_monitor', name: 'Фото КЕ Монитор', filename: 'Фото КЕ Монитор', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_golosovoy', name: 'Фото КЕ Голосовой шлюз', filename: 'Фото КЕ Голосовой шлюз', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_router_master', name: 'Фото КЕ Роутер Мастер', filename: 'Фото КЕ Роутер Мастер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_router_rezerv', name: 'Фото КЕ Роутер Резерв', filename: 'Фото КЕ Роутер Резерв', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_printer', name: 'Фото КЕ Принтер', filename: 'Фото КЕ Принтер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'ke_skaner_a4', name: 'Фото КЕ Сканер А4', filename: 'Фото КЕ Сканер А4', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ],
    sn: [
      { id: 'sn_server_pk', name: 'СН Серверного ПК', filename: 'СН Серверного ПК', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_ibp_server', name: 'СН ИБП Сервер', filename: 'СН ИБП Сервер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_pkd', name: 'СН ПКД', filename: 'СН ПКД', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_ibp_pkd', name: 'СН ИБП ПКД', filename: 'СН ИБП ПКД', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_monitor', name: 'СН Монитор', filename: 'СН Монитор', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_golosovoy', name: 'СН Голосовой шлюз', filename: 'СН Голосовой шлюз', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_router_master', name: 'СН Роутер Мастер', filename: 'СН Роутер Мастер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_router_rezerv', name: 'СН Роутер Резерв', filename: 'СН Роутер Резерв', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_printer', name: 'СН Принтер', filename: 'СН Принтер', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' },
      { id: 'sn_skaner_a4', name: 'СН Сканер А4', filename: 'СН Сканер А4', hint: 'Текст маркировок читаемым; Изображение четким; Наклейка + оборудование видно.' }
    ]
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
      } else if (['kassa_zona', 'kso', 'vesi_napolnie', 'vesi_samoobsl', 'vesi_pechat', 'mp', 'stp', 'rmd'].includes(eq.id)) {
        sectionName = `${eq.name} ${n}`;
        sectionPrefix = eq.name;
        numSuffix = n;
      } else {
        sectionName = eq.name;
        sectionPrefix = eq.name;
        numSuffix = '';
      }

      const photoTypes = getPhotoTypes(eq.id).filter(pt => {
        if (type === 'mk' && eq.id === 'kassa' && (pt.id === 'ke_monitor' || pt.id === 'sn_monitor')) return false;
        if ((type === 'mm_uks' || type === 'mm_rmd') && eq.id === 'kassa_zona' && (pt.id === 'ke_monitor' || pt.id === 'sn_monitor')) return false;
        if (type === 'gm' && eq.id === 'kassa_zona' && (pt.id === 'ke_monitor' || pt.id === 'sn_monitor')) return false;
        return true;
      });
      const formattedTypes = photoTypes.map(pt => {
        let filename;

        if (type === 'mk') {
          if (eq.id === 'kassa') {
            filename = `${sectionPrefix} ${numSuffix} ${pt.filename}`;
          } else if (['td', 'tsd'].includes(eq.id)) {
            filename = `${sectionPrefix}${numSuffix} ${pt.filename}`;
          } else if (eq.id === 'uks' || eq.id === 'mp' || eq.id === 'stp') {
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
  vesi_napolnie: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>`,
  vesi_samoobsl: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>`,
  vesi_pechat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>`,
  mp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9V6a6 6 0 1112 0v3"/><rect x="3" y="9" width="18" height="12" rx="1"/></svg>`,
  stp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 18V4a1 1 0 011-1h10a1 1 0 011 1v14"/><rect x="3" y="16" width="18" height="4" rx="1"/><path d="M8 8h8M8 11h8"/></svg>`,
  rmd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="8" cy="10" r="2"/><circle cx="16" cy="10" r="2"/></svg>`,
  prochee: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`
};

const EQUIPMENT_ICONS = {
  kassa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="14" r="1"/></svg>`,
  kassa_zona: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="14" r="1"/></svg>`,
  kso: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><circle cx="12" cy="15" r="2"/></svg>`,
  td: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M6 12h12M6 16h8"/></svg>`,
  tsd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>`,
  uks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  vesi_napolnie: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>`,
  vesi_samoobsl: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>`,
  vesi_pechat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>`,
  mp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9V6a6 6 0 1112 0v3"/><rect x="3" y="9" width="18" height="12" rx="1"/></svg>`,
  stp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 18V4a1 1 0 011-1h10a1 1 0 011 1v14"/><rect x="3" y="16" width="18" height="4" rx="1"/><path d="M8 8h8M8 11h8"/></svg>`,
  rmd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="8" cy="10" r="2"/><circle cx="16" cy="10" r="2"/></svg>`
};
