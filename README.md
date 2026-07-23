# Фото Отчёты / Photo Reports

PWA for creating technical maintenance reports for Magnit retail stores.

**[RU]**
PWA для создания отчётов о техническом обслуживании торговых точек сети «Магнит».

**[EN]**
PWA for creating technical maintenance reports for Magnit retail stores.

---

## Installation / Установка

**Online:** [https://taffan.github.io/tocam/](https://taffan.github.io/tocam/)

**[RU]** На телефоне: меню браузера → «Добавить на главный экран»

**[EN]** On mobile: browser menu → "Add to Home Screen"

---

## Features / Возможности

| [EN] | [RU] |
|-------|-------|
| 5 report types: MK, MM(UKS), MM(RMD), MA, GM | 5 типов отчётов: МК, ММ(УКС), ММ(РМД), МА, ГМ |
| Torch/flashlight in barcode scanner | Фонарик в сканере ШК |
| Auto-update via Service Worker | Автообновление через Service Worker |
| Equipment configuration | Конфигурация оборудования |
| Photo capture + gallery preview | Фотофиксация + просмотр/галерея |
| Photo from device gallery (left 60px zone or long press) | Выбор фото из галереи (левая зона 60px или долгое нажатие) |
| KE (inventory numbers) — barcode scanner + preview | КЕ (инвентарные номера) — сканер ШК + превью |
| SN (serial numbers) — barcode scanner + preview | СН (серийные номера) — сканер ШК + превью |
| Interactive scanner: yellow boxes → select → green/red tracking | Интерактивный сканер: блоки → выбор → зелёная/красная рамка |
| Photo quality settings (3 levels) | Настройка качества фото (3 уровня) |
| Scanner quality settings (3 levels) | Настройка качества сканера (3 уровня) |
| Dark theme | Тёмная тема |
| Help page with usage guide | Справка с описанием функционала |
| Offline auto-save | Автосохранение офлайн |
| ZIP export with XLSX + Codes.txt | Экспорт в ZIP с XLSX и Коды.txt |

---

## Equipment / Оборудование

| [EN] | [RU] |
|-------|-------|
| Checkout | Касса |
| Self-checkout | КСО |
| Distribution node | ТД |
| Handheld terminal | ТСД |
| Universal checkout table | УКС |
| Manager workstation (RMD) | РМД |
| Server room | Серверная |
| Scales | Весы (напольные/самообсл./с печатью) |
| Mobile printer | МП |
| Stationary thermal printer | Стац. термопринтер |
| Other | Прочее |

---

## Report Types / Типы отчётов

| Type | [EN] | [RU] | Equipment |
|------|-------|------|-----------|
| MK | Cosmetics | Магнит Косметик | Checkout zone, TD, Handheld, UKS, Mobile printer, Thermal printer |
| MM(UKS) | Supermarket (UKS) | Супермаркет (УКС) | Checkout zone, Self-checkout, TD, Handheld, UKS, Scales, Mobile printer, Thermal printer |
| MM(RMD) | Supermarket (RMD) | Супермаркет (РМД) | Checkout zone, Self-checkout, TD, Handheld, RMD, Scales, Mobile printer, Thermal printer |
| MA | Pharmacy | Магнит Аптека | Checkout zone, TD, Handheld, UKS, Thermal printer |
| GM | Hypermarket | Магнит Гипермаркет | Server room, Checkout zone, Self-checkout, TD, Handheld, Scales (floor/self/print), Mobile printer, Thermal printer |

---

## Photo Types / Типы фото

```
Photos (required)
├── ...

KE (inventory numbers) | Serial numbers
├── (paired rows, equal-height buttons) — optional
```

| [EN] | [RU] | Required | Scanner |
|-------|-------|---------|---------|
| Photos | Фото | ✅ | — |
| KE (inventory) | КЕ (инвентарные) | ❌ | Barcode (13/4 digits) |
| SN (serial) | СН (серийные) | ❌ | Barcode (any) |

---

## Export Format / Формат экспорта

```
ZIP Archive/
├── XLSX Report
├── Photos
├── KE/ (inventory photos)
├── Serial Numbers/ (serial photos)
├── Codes.txt
└── report.json
```

### Codes.txt

```
Photo Report — Store Name
Date: 2026-07-14
Technician: Name

Total photos: 24
KE: 3 of 6
Serial numbers: 2 of 6

KE (inventory numbers):
  1234567890123
  ...

Serial numbers:
  QR-CODE-DATA
  CODE128-DATA
  ...
```

---

## Offline / Офлайн

**[RU]** После первой загрузки работает полностью офлайн.

**[EN]** Works fully offline after first load.

---

## Sharing / Отправка

| Platform | Status |
|----------|--------|
| **iOS (15+)** | ✅ AirDrop, WhatsApp, Telegram |
| **Android** | ⚠️ Save → send manually |
| **PC** | ⚠️ Save to Downloads (share unsupported) |

---

## Barcode Scanner / Сканер

- BarcodeDetector API (Android Chrome 83+, iOS Safari 16.4+) — offline
- ZXing fallback (iOS < 16.4, старые Android)
- Interactive selection: yellow boxes → tap to select → green/red tracking
- Confirmed code tracking: green frame (found), red frame (lost)
- **KE mode:** 13-digit EAN-13 or 4-digit codes only (digits)
- **SN mode:** any barcode or QR code accepted
- Flicker-free overlays (cached code set, no DOM rebuild on unchanged frames)
- Scanner resolution settings: Low (640×480), Medium (1280×720), High (1920×1080)
- Torch/flashlight toggle button in scanner (KE/SN)
- Long press (1.5s) on any photo type button to pick from device gallery
- Sound + vibration

## Settings / Настройки

- **Photo quality:** Economy (1024px), Medium (1920px), High (3264px) — always resized to 1280px max
- **Scanner quality:** Low (640×480), Medium (1280×720), High (1920×1080)
- **Dark theme:** toggle switch, saved to localStorage

## Help / Справка

- Red "?" button in the header (between logo and menu)
- Tap again to close (returns to previous page)
- Usage guide: report creation, photography (short tap / left 60px zone / long press), scanner, gallery, completion, export

---

## Project Structure / Структура проекта

```
├── index.html     — UI
├── styles.css     — styles
├── app.js        — logic
├── data.js       — configs
├── sw.js         — Service Worker
├── manifest.json — PWA manifest
└── lib/
    ├── jszip.min.js — ZIP
    ├── zxing.min.js — scanner
    └── xlsx.min.js  — Excel
```

---

## Resources / Ресурсы

- **Online:** https://taffan.github.io/tocam/
- **GitHub:** https://github.com/Taffan/tocam
